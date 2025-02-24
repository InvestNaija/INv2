`k port-forward depl-auth-postgres-57b4c98d46-pzjk4 -n inv2 5432:5432`
`k port-forward depl-rabbitmq-0 -n inv2 15672:15672`
`k port-forward depl-rabbitmq-0 -n inv2 5672:5672`
`k port-forward depl-redis-6664db5d7c-fnf8v -n inv2 6379:6379`

- To see your services (cluster IP), do...  `kubectl get services`
- To get all your existing deployments, run...  `kubectl get deployments -n inv2`
- To automatically delete existing deployment and pull latest from docker, do... `kubectl rollout restart deployment depl-auth -n inv2`
- To delete existing secret, do `kubectl delete secret jwt-secret --ignore-not-found`
 Then, in your container, add an env section like so...
```docker
  container:
    - name: auth
    ...
    env:
      - name: ACCESS_TOKEN_SECRET
        valueFrom:
          secretKeyRef:
            name: jwt-secret
            key: ACCESS_TOKEN_SECRET
```
- To see your contexts and name `kubectl config view`
- Then you can swap context by: `kubectl config use-context <context_name>`

- For errors in async, you can do 
  ```javascript
  next(new NotFoundError())
  ```
  or use the throw keyword using a 3rd party package like so `npm i express-async-errors`
  then use it like so
  ```javascript
  import 'express-async-errors'
  ```

# Backend
## Basic Startup
`npm i typescript ts-node-dev express cors helmet dotenv @inv2/common class-validator `
`npm i -D @types/express`
`tsc --init` - Remember to run this and `"esModuleInterop": true`, else your tests will fail
`npm init @eslint/config@latest`...Remember to add `"overrides": { "eslint": "^9.9.0" }` to your package.json
## Dependency Injection
You may want to use DI in your service, 
- `npm i tsyringe reflect-metadata ` tsyringe is a module from microsoft
- ensure __experimentalDecorators__ and __emitDecoratorMetadata__ are set to true
- In your Controller/Service that depends on a service, at the top put @autoInjectable() metadata
- In your index file, `import 'reflect-metadata'` and `import {container} from tsyringe`
- Then you can get the controller like so, `const bookController = container.resolve(BookController)`

## For running test use jest and supertest
`npm i -D @types/jest @types/supertest jest ts-jest supertest mongodb-memory-server` 
- Notice we are using an in-memory mongodb server. Use it only when we are using MongoDB server

## Skaffold
To manage orchestration in dev environment, get skaffold (on windows, ensure chocolatey is installed): `choco install -y skaffold`  

## NPM
- login to npm `npm login`
- publish to public `npm publish --access public`
- To change the version number for npm ->`npm version patch`
### To update the NPM package in the common module
1. `git add . && git commit -m ""`
2. `npm version patch && npm run build && npm publish --access public`
* Run them one by one...never do this in production...cos you will only ever patch the verison number and always have a generic commit message

## RabbitMq
- Manage RabbitMQ from console `docker exec {{containerid}} rabbitmqctl add_user {{username}} {{password}}`
e.g `docker exec f64695eec0ad rabbitmqctl add_user infinitizon Dickele_1`
- set user as admin `docker exec f64695eec0ad rabbitmqctl set_user_tags infinitizon administrator`
- Delete user `docker exec f64695eec0ad rabbitmqctl delete_user infinitizon`
### Clients
`npm i amqplib`

## Chrome
If you get an unsafe error on chrome browser, simply type `thisisunsafe`


## Deployment

__Azure__
- First go to Azure and create your AKS 
- Then install azure cli by downloading `az` at `https://learn.microsoft.com/en-us/azure/aks/tutorial-kubernetes-deploy-cluster?tabs=azure-cli`
- Run `az aks install-cli`
- `az login`
- `az aks get-credentials --resource-group {{MyResourceGrp}} --name {{MyClusterName}}`
- Remember to run the azure ingress bit `kubectl apply -f https://raw.githubusercontent.com/kubernetes/ingress-nginx/controller-v1.10.1/deploy/static/provider/cloud/deploy.yaml`
- Also login to the Azure container registry that you must have created `az acr login -n {{registryName}}` e.g `az acr login -n INv2Registry`
- We now need to allow AKS access ACR `az aks update --resource-group CHD_Mobile-2 --name INv2-Test --attach-acr {{registryName}}`  
  e.g. `az aks update --resource-group CHD_Mobile-2 --name INv2-Test --attach-acr INv2Registry`
- Remember that image names must be tagged as `{{RegistryName}}.azurecr.io/{{applicationName}}` e.g inv2registry.azurecr.io/demo/auth
__Digital Oceans__
- download doctl and place in your environment path
- In terminal, enter `doctl auth init`, then paste your auth token from digital oceans. If we are updating the token `doctl auth init --access-token <new token>`
- In your terminal, enter `doctl kubernetes cluster kubeconfig save <cluster_name>`
- If token expres, go to API section under Digital Oceans and generate new token and type  
- Once you purchase your domainname, add `ns1.digitalocean.com`, `ns2.digitalocean.com`, `ns3.digitalocean.com` to your nameserver list
  In Remember to add the domain name under networking in 

__Ingress__  
- `https://kubernetes.github.io/ingress-nginx/deploy` - Installation
- `https://{{service}}.{{namespace}}.svc.cluster.local/` - To access a service in a namespace...e.g accessing ingress-nginx service from another node

__Nomenclature__
- deploy-m2p-INv2-Auth.yml ==> deploy-mainbranch2prod-INv2-Auth.yml
- deploy-s2do-INv2-Auth.yml ==> deploy-stagingbranch2digitalOcean-INv2-Auth.yml
- test-m-INv2-Auth.yml ==> run test-MainBranch-INv2-Auth.yml

__GitHub secrets__
- Go to your git repository
- Go to settings
- Locate **Secrets and Varibles** under **Security** on the left side bar
- Under the _Secrets_ tab, enter the type of secret required
__Prod__
- create a github personal access token (PAT). Make it limitless
- Git clone your repo
- Go to AWS and clone the repo for the first time, enter the github username and PAT
- Store this credential globally on AWS like so `git config --global credential.helper cache` and `git config --global credential.helper store`
- Delete the cloned repo
- Horray! Now you can run your deployments normally
- Note: to remove the credential, do `git config --global --unset credential.helper` and `git config --system --unset credential.helper`