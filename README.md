# 🧰 Sonar Toolbox
A set of utility tools that one can use with SonarQube (connects via SonarQube WebAPI)

## Disclaimer
This is NOT an official SonarSource product but simply a personal project developed by me, being an avid open-source hobbyist. Please feel free to Star this repo if you have found it helpful.

## Prerequisites

* SonarQube 10.0 and above
* NodeJS v18 and above

## Setup

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

### Generate CSV for all Findings

Generate a CSV file for all Findings (Enterprise License and above is required), which are all of the Issues - Bugs, Vulnerabilities, Code Smells - as well as all of the Security Hotspots in your SonarQube instance:

```bash
npm run findings
```
> Update: This has been further improved to also include the related rule information for each finding.

### Generate CSV for all Issues

In SonarQube, an Issue can be a Bug, Vulnerability or Code Smell.

Generate a CSV file with all of the information related to the **Issues** in your SonarQube instance:
```bash
npm run issues
```

The output CSV Report file can be found at `./output/sonarqube_issues.csv`

Please also note that in SonarQube, by default, the SonarQube UI Dashboard shows all of the Unresolved Issues. To see all of the Issues, one has to use the Filter bar on the left side under the "Resolution" filter and uncheck "Unresolved" to include all of the Issues.

> _Known limitation: 10000 records maximum can be fetched. 
> If you wish to fetch more than 10000 records, refer to [Generate Findings CSV](#generate-csv-for-all-findings)_

### Generate CSV for all Security Hotspots

Generate a CSV file with all of the information related to the **Hotspots** in your SonarQube instance:
```bash
npm run hotspots
```

> _Known limitation: 10000 records maximum can be fetched. 
> If you wish to fetch more than 10000 records, refer to [Generate Findings CSV](#generate-csv-for-all-findings)_

## License
MIT