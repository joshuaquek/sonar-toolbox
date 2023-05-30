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
    { id: 'vulnerabilityProbability', title: 'Vulnerability Probability' }
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

// Create CSV file
async function fetchAndWriteCSV () {
  return new Promise(async (resolve, reject) => {
    try {
      let projectArray = []

      const flattenProjectsRowObject = (rowObject) => {
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

      for (let projectPageIndex = 1; ; projectPageIndex++) {
        const username = process.env.SONARQUBE_TOKEN || '' // replace with your actual username
        const password = ''
        const response = await axios.get(`${process.env.SONARQUBE_HOST || 'http://localhost:9000'}/api/projects/search?p=${projectPageIndex}&ps=100`, { auth: { username, password }, params: { username } })
        const { components, paging: { total } } = response.data || null
        projectArray = components.map(flattenProjectsRowObject)
        if (projectPageIndex >= Math.ceil(total / 100)) break
      }

      const flattenFindingsRowObject = (rowObject) => {
        const flattenString = (str) => str ? he.encode(str).replace(/[\r\n]+/g, '\\n') : ''
        const flattenArray = (arr) => arr ? he.encode(arr.join(',')).replace(/[\r\n]+/g, '\\n') : []
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
          vulnerabilityProbability: flattenString(rowObject.vulnerabilityProbability)
        }
      }

      for (let i = 0; i < projectArray.length; i++) {
        const projectObject = projectArray[i]
        const username = process.env.SONARQUBE_TOKEN || '' // replace with your actual username
        const password = ''
        const response = await axios.get(`${process.env.SONARQUBE_HOST || 'http://localhost:9000'}/api/projects/export_findings?project=${projectObject.key}`, { auth: { username, password }, params: { username } })
        const { export_findings: exportFindings } = response.data || null
        const findingsArrayCSVRow = exportFindings.map(flattenFindingsRowObject)
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
