const axios = require('axios')
const fs = require('fs').promises
const he = require('he')
const outputFileNameAndPath = './output/sonarqube_rules.csv'
const csv = require('csv-writer').createObjectCsvWriter({
  path: outputFileNameAndPath,
  header: [
    { id: 'key', title: 'Key' },
    { id: 'repo', title: 'Repo' },
    { id: 'name', title: 'Name' },
    { id: 'createdAt', title: 'Created At' },
    { id: 'htmlDesc', title: 'HTML Description' },
    { id: 'mdDesc', title: 'Markdown Description' },
    { id: 'severity', title: 'Severity' },
    { id: 'status', title: 'Status' },
    { id: 'isTemplate', title: 'Is Template' },
    { id: 'tags', title: 'Tags' },
    { id: 'sysTags', title: 'System Tags' },
    { id: 'lang', title: 'Language' },
    { id: 'langName', title: 'Language Name' },
    { id: 'params', title: 'Params' },
    { id: 'type', title: 'Type' },
    { id: 'remFnOverloaded', title: 'Remote Function Overloaded' },
    { id: 'scope', title: 'Scope' },
    { id: 'isExternal', title: 'Is External' },
    { id: 'descriptionSections', title: 'Description Sections' },
    { id: 'educationPrinciples', title: 'Education Principles' }
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
      const flattenRowObject = (rowObject) => {
        const flattenString = (str) => str ? he.encode(str).replace(/[\r\n]+/g, '\\n') : ''
        const flattenArray = (arr) => arr ? he.encode(arr.join(',')).replace(/[\r\n]+/g, '\\n') : []
        return {
          key: flattenString(rowObject.key),
          repo: flattenString(rowObject.repo),
          name: flattenString(rowObject.name),
          createdAt: flattenString(rowObject.createdAt),
          htmlDesc: flattenString(rowObject.htmlDesc),
          mdDesc: flattenString(rowObject.mdDesc),
          severity: flattenString(rowObject.severity),
          status: flattenString(rowObject.status),
          isTemplate: rowObject.isTemplate,
          tags: flattenArray(rowObject.tags),
          sysTags: flattenArray(rowObject.sysTags),
          lang: flattenString(rowObject.lang),
          langName: flattenString(rowObject.langName),
          params: JSON.stringify(rowObject.params),
          type: flattenString(rowObject.type),
          remFnOverloaded: rowObject.remFnOverloaded,
          scope: flattenString(rowObject.scope),
          isExternal: rowObject.isExternal,
          descriptionSections: JSON.stringify(rowObject.descriptionSections),
          educationPrinciples: JSON.stringify(rowObject.educationPrinciples)
        }
      }

      for (let pageIndex = 1; ; pageIndex++) {
        const username = process.env.SONARQUBE_TOKEN || '' // replace with your actual username
        const password = ''
        const response = await axios.get(`${process.env.SONARQUBE_HOST || 'http://localhost:9000'}/api/rules/search?p=${pageIndex}&ps=100`, { auth: { username, password }, params: { username } })
        const { rules, total } = response.data
        await csv.writeRecords(rules.map(flattenRowObject))
        if (pageIndex >= Math.ceil(total / 100)) break
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
