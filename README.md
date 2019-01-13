# Paypal Payment Execution Exploit
This example shows how easy it is to do many executes for single approved PayPal payment 


### Install dependencies

```
yarn
```

### Config

Change default.yaml in config folder

### Run

```
yarn start
```

### Test

* Go to http://localhost:3000/index.hmlt
* click checkout and follow the steps
* Check that user has multiple transactions on https://www.sandbox.paypal.com/
* You can change number of chanres by changing variable REPEATS. Some of the execute calls might fail though.
