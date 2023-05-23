# 🧰 Sonar Toolbox
A set of utility tools that one can use with SonarQube (connects via SonarQube WebAPI)

## Disclaimer
This is NOT an official SonarSource product but simply a personal project developed by me, being an avid open-source hobbyist. Please feel free to Star this repo if you have found it helpful.

## Setup

Make sure that you have NodeJS v18 and above

Install required modules:
```bash
npm i --legacy-peer-deps
```

First, generate a **User Token** in SonarQube (not a Project Analysis Token or a Global Analysis Token).

Next, create a `config.json` file in your project directory. It should be of this format:

```bash
{
  "SONARQUBE_HOST": "http://your_ip_address_or_url_here:port_here",
  "SONARQUBE_TOKEN":"your_token_here"
}
```

You can now move to the next section on the various usages of this toolbox

## Usage Instructions

### Generate CSV for all Rules

Generate a CSV file with all of the information related to the **Rules** in your SonarQube instance:
```bash
npm run rules
```

The output CSV Report file can be found at `./output/sonarqube_rules.csv`

### Generate CSV for all Issues

Generate a CSV file with all of the information related to the **Issues** in your SonarQube instance:
```bash
npm run issues
```

The output CSV Report file can be found at `./output/sonarqube_issues.csv`

Please also note that in SonarQube, by default, the SonarQube UI Dashboard shows all of the Unresolved Issues. To see all of the Issues, one has to use the Filter bar on the left side under the "Resolution" filter and uncheck "Unresolved" to include all of the Issues.

## License
MIT