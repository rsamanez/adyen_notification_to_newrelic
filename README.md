# Adyen webhook integration demo


## Requirements

Node.js 8.0+

## Installation

1. Clone this repo:

```
git clone https://github.com/rsamanez/adyen_notification_to_newrelic.git
```

2. Navigate to the root directory and install dependencies:

```
npm install
```

## Usage

1. Create a `./.env` file with all required configuration
   - [Adyen HMAC Key](https://docs.adyen.com/development-resources/webhooks/verify-hmac-signatures)
   - NewRelic Insert Key
   - NewRelic Accoiunt ID

Remember to include `http://localhost:8080` in the list of Allowed Origins

```
PORT=8080
ADYEN_HMAC_KEY="your_hmac_key_here"
NEWRELIC_INSERT_KEY="your_newrelic_ingestion_api_key_here"
NEWRELIC_ACCOUNT_ID="your_newrelic_account_id"
```

2. Start the server:

```
npm run dev
```


## License

MIT license. For more information, see the **LICENSE** file in the root directory.
