# wipeDocumentBlock

### Properties

| Block Property   | Definition                                                                        | Example Input                                   |
| ---------------- | --------------------------------------------------------------------------------- | ----------------------------------------------- |
| type             | Type of workflow logic block.                                                     | **wipeDocument**Block (Can't be changed).       |
| tag              | Unique name for the logic block.                                                  | wipe\_token.                                    |
| permissions      | Which entity has rights to interact at this part of the workflow.                 | Root Authority.                                 |
| defaultActive    | Shows whether this block is active at this time and whether it needs to be shown. | Checked or unchecked.                           |
| dependencies     | Establish workflow dependancies that need to be completed prior.                  | Select the appropriate block from the dropdown. |
| stop Propagation | End processing here, don't pass control to the next block.                        | Checked or unchecked.                           |

### UI Properties

| UI Property | Definition                                                                 |
| ----------- | -------------------------------------------------------------------------- |
| Token       | Select which token to wipe. The token must exist in the Guardian instance. |
| Rule        | Enter any wiping calculations.                                             |
