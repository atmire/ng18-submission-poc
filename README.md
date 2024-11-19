# Angular 18 Submission Form POC

## Description

In order to test the use of Angular 18 forms in the current Angular 17 app, I made a separate Angular 18 web component using [Angular Elements](https://angular.dev/guide/elements), which is then used in dspace

You'll find the submission code in `/libs/ng18-submission`. This is where all the relevant code for this POC can be found 

DSpace itself is located in `/dspace-angular`. It only contains the necessary changes to replace dspace's default submission with the web component 

This POC only works on collections that have a "publicationStep" as a configured submission step, as that had to be hardcoded. The default "1-step workflow" collection on the demo site is an example

You should be able to edit and save form values. If you open an in progress submission either made with this app, or the standard dspace UI, it should work.

Just like in the formly POC, I made a onebox and a date field. Both were implemented to be form-controls in the same way a regular input or select is. They're a black box for the rest of the form. Each has its own internal form group and controls, but they get and set their value, and report their changes as a unit. This means we can simply use MetadataValues as the type of the value these custom form controls emit

There is also a very rudimentary auto save, if you uncomment the `setInterval` line in SubmissionFormComponent's ngOnInit, and that proves that you won't lose the focus if you're typing while a save happens. That works much nicer than it does in DSpace 8 and I suspect it's down to the use of signals everywhere. However, I left this off by default, because it has no error handling: if one PATCH fails it will keep trying to auto-save the same error indefinitely

## Building & running 
Build the submission web component
- `cd libs/ng18-submission`
- `npm run watch`

Start DSpace, in a different terminal
- `cd dspace-angular`
- `npm run start:dev`
                                                                            
## Note
Using a web component with a different Angular version works for a POC, but it's a horrible idea in production. It would require users to download _both_ Angular versions. However using Angular Elements is something we can investigate further to help modularize dspace, as long as we use the same Angular version for the components and the main app. Angular also has good ootb support for that use case, whereas I needed a few hacks to get it to work using different Angular versions
