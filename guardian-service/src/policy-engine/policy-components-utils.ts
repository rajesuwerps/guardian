import {
    PolicyBlockConstructorParams,
    PolicyBlockFullArgumentList,
    PolicyBlockMap,
    PolicyTagMap
} from '@policy-engine/interfaces';
import { PolicyRole } from 'interfaces';
import { IAuthUser } from '@auth/auth.interface';
import { GenerateUUIDv4 } from './helpers/uuidv4';
import { AnyBlockType, IPolicyBlock, IPolicyInterfaceBlock } from './policy-engine.interface';
import { getMongoRepository } from 'typeorm';
import { Policy } from '@entity/policy';
import { STATE_KEY } from '@policy-engine/helpers/constants';
import { GetBlockByType } from '@policy-engine/blocks/get-block-by-type';
import { GetOtherOptions } from '@policy-engine/helpers/get-other-options';
import { PolicyEvent } from './interfaces/policy-event';

export class PolicyComponentsUtils {
    public static BlockUpdateFn: (uuid: string, state: any, user: IAuthUser, tag?: string) => void;
    public static BlockErrorFn: (blockType: string, message: any, user: IAuthUser) => void;
    private static ExternalDataBlocks: Map<string, IPolicyBlock> = new Map();
    private static PolicyBlockMapObject: PolicyBlockMap = new Map();
    private static PolicyTagMapObject: Map<string, PolicyTagMap> = new Map();
    private static BlockEventSubscriptions: Map<string, Map<string, Map<string, Function[]>>> = new Map();

    public static RegisterEvent(policyId: string, tag: string, eventType: string, fn: Function): void {
        let policyMap: Map<string, Map<string, Function[]>>;
        if (PolicyComponentsUtils.BlockEventSubscriptions.has(policyId)) {
            policyMap = PolicyComponentsUtils.BlockEventSubscriptions.get(policyId);
        } else {
            policyMap = new Map();
            PolicyComponentsUtils.BlockEventSubscriptions.set(policyId, policyMap);
        }

        let tagMap: Map<string, Function[]>;
        if (policyMap.has(tag)) {
            tagMap = policyMap.get(tag);
        } else {
            tagMap = new Map();
            policyMap.set(tag, tagMap);
        }

        let subscriptionsArray: Function[];
        if (!Array.isArray(tagMap.get(eventType))) {
            subscriptionsArray = [];
            tagMap.set(eventType, subscriptionsArray);
        } else {
            subscriptionsArray = tagMap.get(eventType);
        }

        subscriptionsArray.push(fn);
    }

    public static RemoveEventAll(policyId: string, tag: string, eventType: string): void {
        if (PolicyComponentsUtils.BlockEventSubscriptions.has(policyId)) {
            const policy = PolicyComponentsUtils.BlockEventSubscriptions.get(policyId);
            if (policy.has(tag)) {
                const block = policy.get(tag);
                if (block.has(eventType)) {
                    block.set(eventType, []);
                }
            }
        }
    }

    public static TriggerEvent(event: PolicyEvent<any>): void {
        if (PolicyComponentsUtils.BlockEventSubscriptions.has(event.policyId)) {
            const policy = PolicyComponentsUtils.BlockEventSubscriptions.get(event.policyId);
            if (policy.has(event.target)) {
                const block = policy.get(event.target);
                if (block.has(event.type)) {
                    const functions = block.get(event.type);
                    for (let i = 0; i < functions.length; i++) {
                        const fn = functions[i];
                        fn(event);
                    }
                }
            }
        }
    }

    /**
     * Return new uniq id for block
     */
    public static GenerateNewUUID(): string {
        let uuid: string;
        do {
            uuid = GenerateUUIDv4();
        } while (PolicyComponentsUtils.PolicyBlockMapObject.has(uuid));
        return uuid;
    }

    /**
     * Register new block instance in policy
     * @param policyId
     * @param component
     * @constructor
     */
    public static RegisterComponent(policyId: string, component: IPolicyBlock): void {
        PolicyComponentsUtils.PolicyBlockMapObject.set(component.uuid, component);
        let tagMap;
        if (!this.PolicyTagMapObject.has(policyId)) {
            tagMap = new Map();
            this.PolicyTagMapObject.set(policyId, tagMap);
        } else {
            tagMap = this.PolicyTagMapObject.get(policyId);
        }
        if (component.tag) {
            if (tagMap.has(component.tag)) {
                throw new Error(`Block with tag ${component.tag} already exist`);
            }
            tagMap.set(component.tag, component.uuid);
        }
        if (component.blockClassName === 'ExternalData') {
            PolicyComponentsUtils.ExternalDataBlocks.set(component.uuid, component);
        }

        component.start();
    }

    /**
     * Run policy block instance action when external data income
     * @param data
     */
    public static async ReceiveExternalData(data: any): Promise<void> {
        for (let block of PolicyComponentsUtils.ExternalDataBlocks.values()) {
            const policy = await getMongoRepository(Policy).findOne({ policyTag: data.policyTag });
            if (policy.id.toString() === (block as any).policyId) {
                await (block as any).receiveData(data);
            }
        }
    }

    /**
     * Check if id already registered
     * @param uuid
     */
    public static IfUUIDRegistered(uuid: string): boolean {
        return PolicyComponentsUtils.PolicyBlockMapObject.has(uuid);
    }

    /**
     * Check if user role has permission for block
     * @param uuid
     * @param role
     * @param user
     */
    public static IfHasPermission(uuid: string, role: PolicyRole, user: IAuthUser | null): boolean {
        const block = PolicyComponentsUtils.PolicyBlockMapObject.get(uuid);
        return block.hasPermission(role, user);
    }

    /**
     * Get block instance by uuid
     * @param uuid
     */
    public static GetBlockByUUID<T extends (IPolicyInterfaceBlock | IPolicyBlock)>(uuid: string): T {
        return PolicyComponentsUtils.PolicyBlockMapObject.get(uuid) as T;
    }

    /**
     * Get block instance by tag
     * @param policyId
     * @param tag
     */
    public static GetBlockByTag(policyId: string, tag: string): IPolicyBlock {
        return PolicyComponentsUtils.PolicyBlockMapObject.get(this.PolicyTagMapObject.get(policyId).get(tag));
    }

    /**
     * Return block state fields
     * @param target
     */
    public static GetStateFields(target): any {
        return target[STATE_KEY];
    }

    /**
     * Configure new block instance
     * @param policyId
     * @param blockType
     * @param options
     * @param skipRegistration
     */
    public static ConfigureBlock(policyId: string, blockType: string,
        options: Partial<PolicyBlockConstructorParams>,
        skipRegistration?: boolean): any {
        if (options.options) {
            options = Object.assign(options, options.options);
        }
        const blockConstructor = GetBlockByType(blockType) as any;
        const instance = new blockConstructor(
            options.id || PolicyComponentsUtils.GenerateNewUUID(),
            options.defaultActive,
            options.tag,
            options.permissions,
            options.dependencies,
            options._parent,
            GetOtherOptions(options as PolicyBlockFullArgumentList)
        );
        instance.setPolicyId(policyId);
        if (!skipRegistration) {
            PolicyComponentsUtils.RegisterComponent(policyId, instance);
        }
        return instance;
    }

    /**
     * Return block instance reference
     * @param obj
     */
    public static GetBlockRef<T extends AnyBlockType>(obj: any): T {
        return obj as T;
    }

    /**
     * Return block options object
     * @param obj
     */
    public static GetBlockUniqueOptionsObject(obj: any): { [key: string]: any } {
        return obj.options;
    }
}