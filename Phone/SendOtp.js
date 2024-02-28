app.post('/otp/send', function (req, res) {
    const config = {
      headers: {
        'Content-Type': 'application/json',
        'api-key': '',
        'api-login': '',
        'cache-control': 'cache-control'
      }
    }
    axios.post('https://api.octopush.com/v1/public/sms-campaign/send',
      req.body,
      config)
      .then(function () {
        for (const n of req.body.recipients) {
          deliveryStatusAndNumbers[n.phone_number] = 'SENT'
        }
        res.setHeader('content-type', 'Application/json')
        res.statusCode = 200
        res.json({ response_desc: 'Success' })
      })
      .catch(function (error) {
        console.log(error)
      })
  })