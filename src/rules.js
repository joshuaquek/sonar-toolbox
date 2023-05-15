require('dotenv').config()
const axios = require('axios')
const fs = require('fs')
const he = require('he')
const csv = require('csv-writer').createObjectCsvWriter({
  path: './output/sonarqube_rules.csv',
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

if (fs.existsSync('./output/sonarqube_rules.csv')) { fs.unlinkSync('./output/sonarqube_rules.csv') }

async function fetchAndWriteRules () {
  const flattenRule = (rule) => {
    const flattenString = (str) => he.encode(str).replace(/[\r\n]+/g, '\\n')
    const flattenArray = (arr) => he.encode(arr.join(',')).replace(/[\r\n]+/g, '\\n')
    return {
      key: flattenString(rule.key),
      repo: flattenString(rule.repo),
      name: flattenString(rule.name),
      createdAt: flattenString(rule.createdAt),
      htmlDesc: flattenString(rule.htmlDesc),
      mdDesc: flattenString(rule.mdDesc),
      severity: flattenString(rule.severity),
      status: flattenString(rule.status),
      isTemplate: rule.isTemplate,
      tags: flattenArray(rule.tags),
      sysTags: flattenArray(rule.sysTags),
      lang: flattenString(rule.lang),
      langName: flattenString(rule.langName),
      params: JSON.stringify(rule.params),
      type: flattenString(rule.type),
      remFnOverloaded: rule.remFnOverloaded,
      scope: flattenString(rule.scope),
      isExternal: rule.isExternal,
      descriptionSections: JSON.stringify(rule.descriptionSections),
      educationPrinciples: JSON.stringify(rule.educationPrinciples)
    }
  }

  for (let pageIndex = 1; ; pageIndex++) {
    const username =  process.env.SONARQUBE_TOKEN || '' // replace with your actual username
    const password = ''
    const response = await axios.get(`${process.env.SONARQUBE_HOST || 'http://localhost:9000'}/api/rules/search?p=${pageIndex}&ps=100&asc=true`, { auth: { username, password }, params: { username } })
    const { rules, total } = response.data
    await csv.writeRecords(rules.map(flattenRule))
    if (pageIndex >= Math.ceil(total / 100)) break
  }
}

fetchAndWriteRules().then(() => console.log('✅ Done')).catch((error) => console.error(error))
