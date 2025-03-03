# aggregateDocumentBlock

### Properties

Input - a document or an array of documents which will be aggregated&#x20;

Output - an array of documents, after the reporting period expired or the condition is met

| Block Property   | Definition                                                                        | Example Input                                                                         |
| ---------------- | --------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------- |
| tag              | Unique name for the logic block.                                                  | aggregateDocumentBlock                                                                |
| permissions      | Which entity has rights to interact at this part of the workflow.                 | Root Authority.                                                                       |
| defaultActive    | Shows whether this block is active at this time and whether it needs to be shown. | Checked or unchecked.                                                                 |
| dependencies     | Establish workflow dependancies that need to be completed prior.                  | Select the appropriate block from the dropdown.                                       |
| On errors        | Called if the system error has occurs in the Block                                | <p></p><ul><li>No action</li><li>Retry</li><li>Go to step</li><li>Go to tag</li></ul> |
| stop Propagation | End processing here, don't pass control to the next block.                        | Checked or unchecked.                                                                 |
| AggregateType    | Type of Aggregate                                                                 | <p></p><ul><li>Cumulative Dimension</li><li> Period</li></ul>                         |

```
If ‘Aggregate Type’ = ‘Cumulative Dimension’
			Expressions - calculated variables which help to ease the work with Condition and enable complex calculations
				Expression (i)
					Variable Name (string) - name of the the variable
					Variable Value (string) - formula for calculating of the value of the variable
			Condition (string) - condition expression which can contain math formulas
		
If ‘Aggregate Type’ = ‘Period’
			Timer - timer object to track the aggregation period (launched separately)
			(Please note that this functionality will change in the near future)

			Empty Data - if this parameter is set to true the timer gets triggered even if there were no data
```

### UI Properties

| UI Property | Definition                   | Status                                     |
| ----------- | ---------------------------- | ------------------------------------------ |
| Rule        | Type of Rule                 | <mark style="color:red;">Deprecated</mark> |
| Threshold   | Enter threshold calculations | <mark style="color:red;">Deprecated</mark> |
