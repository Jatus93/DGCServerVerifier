# DGCServerVerifier

## what is it?
This web server takes a post request on ``/api/green`` with a json object as body.

Verifies if the data are correct:
  * Downloads the last rules released on https://get.dgc.gov.it/v1/dgc/settings
  * Downloads the valid keys on https://get.dgc.gov.it/v1/dgc/signercertificate/status and https://get.dgc.gov.it/v1/dgc/signercertificate/update.
  * Verifies that the certificate is correctly encoded, as per standard.
  * Verifies signature on the certificate is still valid as the day of the request.
  * Verifies that DGC provided is still valid as today using the setting in the first point.

## how does it work?
To perform a request to the endpoint, preferably behind a reverse proxy in HTTPS, you should
build a JSON object with this structure:


    {key:'HC1:6BFOXN%TS3DHPVO13J /G-/2YRVA.Q/R8VRU2FC1J9M$DI9C3K9$:L44HRJPC%OQHIZC4.OI1RM8ZA.A5:S9MKN4NN3F85QNCY0O%0VZ001HOC9JU0D0HT0HB2PL/IB*09B9LW4T*8+DC9I0%YB/VM$*SBAKYE9*FJ7ID$0HY84Q:GY3LV2LW 2C0IO$571IL+9J2P6%24.8P+5E/HW.CV2L%3L%*8PHN6D7LLK*2HG%89UV-0LZ 2ZJJ %C4IJZJJBY43%8 C1VHLEC78G1TFHM*K2ILS-O:S9UZ4+FJE 4Y3LO78L:P...ecc'}

The string is the raw value read from a QR code reader app.

## what does it return?
When the request is complete, the server returns a JSON object with this structure:

    {
      "signature": {
        "valid": true,
      },
      "valid": {
          "valid": true,
          "message": "Certificate is valid"
      },
      "info": {
        "identity": {
            "fnt": "ROSSI",
            "fn": "ROSSI",
            "gnt": "MARIO",
            "gn": "MARIO"
        },
        "dob": "1973-06-22"
      }
    }

## third party copyright notice
This software uses the library [DCC Utils](https://github.com/ministero-salute/dcc-utils) written by ministero-salute