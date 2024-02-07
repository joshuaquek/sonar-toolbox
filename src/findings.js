const axios = require('axios')
const fs = require('fs').promises
const he = require('he')
const outputFileNameAndPath = './output/sonarqube_findings.csv'
const csv = require('csv-writer').createObjectCsvWriter({
  path: outputFileNameAndPath,
  header: [
    { id: 'key', title: 'Key' },
    { id: 'projectKey', title: 'Project Key' },
    { id: 'branch', title: 'Branch' },
    { id: 'path', title: 'Path' },
    { id: 'lineNumber', title: 'Line Number' },
    { id: 'message', title: 'Message' },
    { id: 'status', title: 'Status' },
    { id: 'author', title: 'Author' },
    { id: 'createdAt', title: 'Creation Date' },
    { id: 'updatedAt', title: 'Update Date' },
    { id: 'ruleReference', title: 'Rule Reference' },
    { id: 'comments', title: 'Comments' },
    { id: 'type', title: 'Type' },
    { id: 'severity', title: 'Severity' },
    { id: 'effort', title: 'Effort' },
    { id: 'tags', title: 'Tags' },
    { id: 'securityCategory', title: 'Security Category' },
    { id: 'vulnerabilityProbability', title: 'Vulnerability Probability' },
    { id: 'ruleKey', title: 'Rule Key' },
    { id: 'ruleRepo', title: 'Rule Repo' },
    { id: 'ruleName', title: 'Rule Name' },
    { id: 'ruleCreatedAt', title: 'Rule Created At' },
    { id: 'ruleHtmlDesc', title: 'Rule HTML Description' },
    { id: 'ruleMdDesc', title: 'Rule Markdown Description' },
    { id: 'ruleSeverity', title: 'Rule Severity' },
    { id: 'ruleStatus', title: 'Rule Status' },
    { id: 'ruleIsTemplate', title: 'Rule Is Template' },
    { id: 'ruleTags', title: 'Rule Tags' },
    { id: 'ruleSysTags', title: 'Rule System Tags' },
    { id: 'ruleLang', title: 'Rule Language' },
    { id: 'ruleLangName', title: 'Rule Language Name' },
    { id: 'ruleParams', title: 'Rule Params' },
    { id: 'ruleType', title: 'Rule Type' },
    { id: 'ruleRemFnOverloaded', title: 'Rule Remote Function Overloaded' },
    { id: 'ruleScope', title: 'Rule Scope' },
    { id: 'ruleIsExternal', title: 'Rule Is External' },
    { id: 'ruleDescriptionSections', title: 'Rule Description Sections' },
    { id: 'ruleEducationPrinciples', title: 'Rule Education Principles' },
    { id: 'ruleCweCodes', title: 'Rule Cwe Codes' }
  ]
})

// Read config.json file
async function readConfigFile () {
  return new Promise(async (resolve, reject) => {
    try {
      const jsonString = await fs.readFile('./config.json', 'utf8')
      const data = JSON.parse(jsonString)
      process.env.SONARQUBE_HOST = data.SONARQUBE_HOST
      process.env.SONARQUBE_TOKEN = data.SONARQUBE_TOKEN
      return resolve()
    } catch (err) {
      if (err.code === 'ENOENT') {
        console.log('Error reading config.json file from disk:', err)
        return reject(err)
      } else {
        console.log('Error parsing JSON string:', err)
        return reject(err)
      }
    }
  })
}

// Clean up old CSV and create new blank CSV
async function cleanUpOldFiles () {
  return new Promise(async (resolve, reject) => {
    try {
      await fs.access(outputFileNameAndPath)
      await fs.unlink(outputFileNameAndPath)
      const filehandle = await fs.open(outputFileNameAndPath, 'w')
      await filehandle.close()
      return resolve()
    } catch (err) {
      return reject(err)
    }
  })
}

async function fetchRuleDetails (ruleReference) {
  try {
    const username = process.env.SONARQUBE_TOKEN || '' // replace with your actual username
    const password = ''
    const response = await axios.get(`${process.env.SONARQUBE_HOST}/api/rules/show?key=${ruleReference}`, { auth: { username, password }, params: { username } })
    const ruleDetails = response.data && response.data.rule ? response.data.rule : null
    return ruleDetails
  } catch (error) {
    console.error(`Error fetching rule details for ruleReference '${ruleReference}':`, error)
    return null
  }
}

function flattenProjectsRowObject (rowObject) {
  const flattenString = (str) => str ? he.encode(str).replace(/[\r\n]+/g, '\\n') : ''
  return {
    key: flattenString(rowObject.key),
    name: flattenString(rowObject.name),
    qualifier: flattenString(rowObject.qualifier),
    visibility: flattenString(rowObject.visibility),
    lastAnalysisDate: flattenString(rowObject.lastAnalysisDate),
    revision: flattenString(rowObject.revision)
  }
}

function renameRuleObject (ruleObject) {
  const cweRegex = /CWE-\d+/g
  let cweCodes = ruleObject.mdDesc.match(cweRegex)
  if (cweCodes === null) {
    cweCodes = []
  }

  return {
    ruleKey: (ruleObject.key),
    ruleRepo: (ruleObject.repo),
    ruleName: (ruleObject.name),
    ruleCreatedAt: (ruleObject.createdAt),
    ruleHtmlDesc: (ruleObject.htmlDesc),
    ruleMdDesc: (ruleObject.mdDesc),
    ruleSeverity: (ruleObject.severity),
    ruleStatus: (ruleObject.status),
    ruleIsTemplate: ruleObject.isTemplate,
    ruleTags: (ruleObject.tags),
    ruleSysTags: (ruleObject.sysTags),
    ruleLang: (ruleObject.lang),
    ruleLangName: (ruleObject.langName),
    ruleParams: ruleObject.params,
    ruleType: (ruleObject.type),
    ruleRemFnOverloaded: ruleObject.remFnOverloaded,
    ruleScope: (ruleObject.scope),
    ruleIsExternal: ruleObject.isExternal,
    ruleDescriptionSections: (ruleObject.descriptionSections),
    ruleEducationPrinciples: (ruleObject.educationPrinciples),
    ruleCweCodes: cweCodes
  }
}

function flattenFindingsRowObject (rowObject) {
  // const flattenString = (str) => str ? he.encode(str).replace(/[\r\n]+/g, '\\n') : ''
  // const flattenArray = (arr) => arr ? he.encode(arr.join(',')).replace(/[\r\n]+/g, '\\n') : []
  const flattenString = (str) => str ? (str).replace(/[\r\n]+/g, '\\n') : ''
  const flattenArray = (arr) => arr ? (arr.join(',')).replace(/[\r\n]+/g, '\\n') : []
  return {
    key: flattenString(rowObject.key),
    projectKey: flattenString(rowObject.projectKey),
    branch: flattenString(rowObject.branch),
    path: flattenString(rowObject.path),
    lineNumber: flattenString(rowObject.lineNumber),
    message: flattenString(rowObject.message),
    status: flattenString(rowObject.status),
    author: flattenString(rowObject.author),
    createdAt: flattenString(rowObject.createdAt),
    updatedAt: flattenString(rowObject.updatedAt),
    ruleReference: flattenString(rowObject.ruleReference),
    comments: flattenArray(rowObject.comments),
    type: flattenString(rowObject.type),
    severity: flattenString(rowObject.severity),
    effort: flattenString(rowObject.effort),
    tags: flattenString(rowObject.tags),
    securityCategory: flattenString(rowObject.securityCategory),
    vulnerabilityProbability: flattenString(rowObject.vulnerabilityProbability),
    ruleKey: flattenString(rowObject.ruleKey),
    ruleRepo: flattenString(rowObject.ruleRepo),
    ruleName: flattenString(rowObject.ruleName),
    ruleCreatedAt: flattenString(rowObject.ruleCreatedAt),
    ruleHtmlDesc: flattenString(rowObject.ruleHtmlDesc),
    ruleMdDesc: flattenString(rowObject.ruleMdDesc),
    ruleSeverity: flattenString(rowObject.ruleSeverity),
    ruleStatus: flattenString(rowObject.ruleStatus),
    ruleIsTemplate: rowObject.ruleIsTemplate,
    ruleTags: flattenArray(rowObject.ruleTags),
    ruleSysTags: flattenArray(rowObject.ruleSysTags),
    ruleLang: flattenString(rowObject.ruleLang),
    ruleLangName: flattenString(rowObject.ruleLangName),
    ruleParams: JSON.stringify(rowObject.ruleParams),
    ruleType: flattenString(rowObject.ruleType),
    ruleRemFnOverloaded: rowObject.ruleRemFnOverloaded,
    ruleScope: flattenString(rowObject.ruleScope),
    ruleIsExternal: rowObject.ruleIsExternal,
    ruleDescriptionSections: JSON.stringify(rowObject.ruleDescriptionSections),
    ruleEducationPrinciples: JSON.stringify(rowObject.ruleEducationPrinciples),
    ruleCweCodes: JSON.stringify(rowObject.ruleCweCodes)
  }
}

// Create CSV file
async function fetchAndWriteCSV () {
  return new Promise(async (resolve, reject) => {
    try {
      let projectArray = []

      for (let projectPageIndex = 1; ; projectPageIndex++) {
        const username = process.env.SONARQUBE_TOKEN || '' // replace with your actual username
        const password = ''
        const response = await axios.get(`${process.env.SONARQUBE_HOST || 'http://localhost:9000'}/api/projects/search?p=${projectPageIndex}&ps=100`, { auth: { username, password }, params: { username } })
        const { components, paging: { total } } = response.data || null
        projectArray = components.map(flattenProjectsRowObject)
        if (projectPageIndex >= Math.ceil(total / 100)) break
      }

      for (const projectObject of projectArray) {
        const username = process.env.SONARQUBE_TOKEN || '' // replace with your actual username
        const password = ''
        const response = await axios.get(`${process.env.SONARQUBE_HOST || 'http://localhost:9000'}/api/projects/export_findings?project=${projectObject.key}`, { auth: { username, password }, params: { username } })
        const { export_findings: exportFindings } = response.data || null
        const findingsWithRuleDetails = []
        for (const findingsObject of exportFindings) {
          const rawRuleObject = await fetchRuleDetails(findingsObject.ruleReference)
          const ruleObject = renameRuleObject(rawRuleObject)
          const findingsWithRuleDetailsObject = { ...findingsObject, ...ruleObject }
          findingsWithRuleDetails.push(findingsWithRuleDetailsObject)
        }
        const findingsArrayCSVRow = findingsWithRuleDetails.map(flattenFindingsRowObject)
        console.log('>>> Writing Row to CSV file...')
        if (findingsArrayCSVRow.length > 0) await csv.writeRecords(findingsArrayCSVRow)
      }

      return resolve()
    } catch (error) {
      return reject(error)
    }
  })
}

// Main function
async function main () {
  try {
    await readConfigFile()
    await cleanUpOldFiles()
    await fetchAndWriteCSV()
    console.log('✅ Done')
  } catch (error) {
    console.error(error)
  }
}

// Run
main()
