# Sonar Toolbox
A set of utility tools that one can use with SonarQube (connects via SonarQube WebAPI)

## Setup

Make sure that you have NodeJS v18 and above

Install required modules:
```
npm i --legacy-peer-deps
```

Next, create a `.env` file in your project directory. It should be of this format:

```bash
SONARQUBE_HOST=http://the.urlOrIpAddressHere.com
SONARQUBE_TOKEN=the_sonarQube_token_here
```

You can now move to the next section on the various usages of this toolbox

## Usages

### Generate CSV for all Issues and Rules

Generate a CSV file with all of the information related to the **Rules** in your SonarQube instance:
```bash
npm run rules
```

Generate a CSV file with all of the information related to the **Issues** in your SonarQube instance:
```bash
npm run rules
```

## License
MIT