require('dotenv').config()
const axios = require('axios')
const fs = require('fs')
const he = require('he')
const csv = require('csv-writer').createObjectCsvWriter({
  path: './output/sonarqube_issues.csv',
  header: [
    { id: 'key', title: 'Key' },
    { id: 'rule', title: 'Rule' },
    { id: 'severity', title: 'Severity' },
    { id: 'component', title: 'Component' },
    { id: 'project', title: 'Project' },
    { id: 'line', title: 'Line' },
    { id: 'hash', title: 'Hash' },
    { id: 'textRange', title: 'Text Range' },
    { id: 'status', title: 'Status' },
    { id: 'message', title: 'Message' },
    { id: 'effort', title: 'Effort' },
    { id: 'debt', title: 'Debt' },
    { id: 'author', title: 'Author' },
    { id: 'tags', title: 'Tags' },
    { id: 'creationDate', title: 'Creation Date' },
    { id: 'updateDate', title: 'Update Date' },
    { id: 'type', title: 'Type' },
    { id: 'scope', title: 'Scope' },
    { id: 'quickFixAvailable', title: 'Quick Fix Available' },
    { id: 'messageFormattings', title: 'Message Formattings' }
  ]
})

if (fs.existsSync('./output/sonarqube_issues.csv')) { fs.unlinkSync('./output/sonarqube_issues.csv') }

async function fetchAndWriteIssues () {
  const flattenIssue = (issue) => {
    const flattenString = (str) => he.encode(str).replace(/[\r\n]+/g, '\\n')
    const flattenArray = (arr) => he.encode(arr.join(',')).replace(/[\r\n]+/g, '\\n')
    return {
      key: flattenString(issue.key),
      rule: flattenString(issue.rule),
      severity: flattenString(issue.severity),
      component: flattenString(issue.component),
      project: flattenString(issue.project),
      line: issue.line,
      hash: flattenString(issue.hash),
      textRange: JSON.stringify(issue.textRange),
      status: flattenString(issue.status),
      message: flattenString(issue.message),
      effort: flattenString(issue.effort),
      debt: flattenString(issue.debt),
      author: flattenString(issue.author),
      tags: flattenArray(issue.tags),
      creationDate: flattenString(issue.creationDate),
      updateDate: flattenString(issue.updateDate),
      type: flattenString(issue.type),
      scope: flattenString(issue.scope),
      quickFixAvailable: issue.quickFixAvailable,
      messageFormattings: JSON.stringify(issue.messageFormattings)
    }
  }

  for (let pageIndex = 1; ; pageIndex++) {
    const username = process.env.SONARQUBE_TOKEN || '' // replace with your actual username
    const password = ''
    const response = await axios.get(`${process.env.SONARQUBE_HOST || 'http://localhost:9000'}/api/issues/search?p=${pageIndex}&ps=100`, { auth: { username, password }, params: { username } })
    const { issues, total } = response.data
    await csv.writeRecords(issues.map(flattenIssue))
    if (pageIndex >= Math.ceil(total / 100)) break
  }
}

fetchAndWriteIssues().then(() => console.log('✅ Done')).catch((error) => console.error(error))
