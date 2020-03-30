const webhookSecretKey = require('../resource/webhook-keys').test.secretKey
const webhook = require('../src/webhooks')({
  mode: 'test',
  webhookSecretKey
})

describe('Webhooks', () => {
  const uri = 'https://some-endpoint.com/post'
  const submissionId = 'someSubmissionId'
  const formId = 'someFormId'

  it('should be signing the signature and generating the X-FormSG-Signature header with the correct format', () => {
    const epoch = 1583136171649
    const signature = webhook.generateSignature({ uri, submissionId, formId, epoch })

    expect(signature).toBe('KMirkrGJLPqu+Na+gdZLUxl9ZDgf2PnNGPnSoG1FuTMRUTiQ6o0jB/GTj1XFjn2s9JtsL5GiCmYROpjJhDyxCw==')

    // X-FormSG-Signature
    const header = webhook.constructHeader({ epoch, submissionId, formId, signature })

    expect(header).toBe(`t=1583136171649,s=someSubmissionId,f=someFormId,v1=KMirkrGJLPqu+Na+gdZLUxl9ZDgf2PnNGPnSoG1FuTMRUTiQ6o0jB/GTj1XFjn2s9JtsL5GiCmYROpjJhDyxCw==`)
  })

  it('should authenticate a signature that was recently generated', () => {
    const epoch = Date.now()
    const signature = webhook.generateSignature({ uri, submissionId, formId, epoch })
    const header = webhook.constructHeader({ epoch, submissionId, formId, signature })

    webhook.authenticate(header, uri)
  })

  it('should reject signatures generated more than 5 minutes ago', () => {
    const epoch = Date.now() - 5 * 60 * 1000 - 1
    const signature = webhook.generateSignature({ uri, submissionId, formId, epoch })
    const header = webhook.constructHeader({ epoch, submissionId, formId, signature })

    expect(() => webhook.authenticate(header, uri)).toThrow()
  })
})