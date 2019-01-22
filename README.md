# shortener

> url shortener

## Concept

This made possible thanks to S3's `Website-Redirect-Location` metadata. Setting this to a URL will have browsers redirected through a HTTP 301 response and the location header.

Summary:
- S3 bucket set to static site serving mode + public object read access
- each bucket object's metadata must includes `Website-Redirect-Location` points to a specific website
- short link template would be `http://[bucket-name].s3-website-eu-west-1.amazonaws.com/[object-key]`

### Todos

- [ ] init script for setting up bucket & add index.html file with proper redirect header
- [ ] ensures public read access for bucket objects

## License

MIT &copy; Dwarves Foundation
