import express, { Request, Response } from 'express';
import axios from 'axios';
import { VCDocumentLoader } from './document-loader/vc-document-loader';
import { DefaultDocumentLoader } from './document-loader/document-loader-default';
import { VCHelper } from './vc-helper';

const PORT = process.env.PORT || 3005;
(async () => {
    const app = express()

    app.use(express.static('public'));
    app.use(express.json());

    const defaultDocumentLoader = new DefaultDocumentLoader();
    const vcDocumentLoader = new VCDocumentLoader('https://localhost/schema', '');
    const vcHelper = new VCHelper();
    vcHelper.addDocumentLoader(defaultDocumentLoader);
    vcHelper.addDocumentLoader(vcDocumentLoader);
    vcHelper.buildDocumentLoader();

    app.post('/mrv-generate', async (req: Request, res: Response) => {
        const { num, config, setting } = req.body;
        const {
            url,
            topic,
            hederaAccountId,
            hederaAccountKey,
            installer,
            did,
            key,
            policyId,
            type,
            context,
            schema,
            policyTag,
            didDocument
        } = config;

        vcDocumentLoader.setDocument(schema);
        vcDocumentLoader.setContext(context);

        let document, vc;
        try {
            const date = (new Date()).toISOString();
            const vcSubject: any = {
                ...context
            };
            if (setting) {
                const keys = Object.keys(setting);
                for (let i = 0; i < keys.length; i++) {
                    const key = keys[i];
                    const item = setting[key];
                    if (item.random) {
                        const _decimal = Math.pow(10, item.decimal + 1);
                        vcSubject[key] = String(Math.round(Math.random() * _decimal));
                    } else {
                        vcSubject[key] = String(item.value);
                    }
                }
            }
            vcSubject.policyId = policyId;
            vcSubject.accountId = hederaAccountId;

            document = await vcHelper.createVC(vcSubject, didDocument, did);
            
            console.log("created vc");
            console.log(document);
        } catch (e) {
            console.error(e);
            res.status(500).json(e);
            return;
        }

        const body = {
            document: document,
            owner: installer,
            policyTag: policyTag
        }
        try {
            console.error('start post');
            const resp = await axios.post(url, body);
            console.error('end post');
        } catch (e) {
            console.error(e);
            res.status(500).json(e);
            return;
        }

        res.status(200).json(document);
    });

    app.listen(PORT, () => {
        console.log('Sender started at port', PORT);
    })
})();
