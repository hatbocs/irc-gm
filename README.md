# Instagram Request Canceler for Greasemonkey

A GM script to cancel pending follow requests on Instagram.

## Usage

Install the script like normal and point your browser to the Current Follow Requests page on Instagram.

```
https://www.instagram.com/accounts/access_tool/current_follow_requests
```

Upon loading, the page will add buttons to cancel one request at a time, or cancel all pending requests in the list.

### What It Does

The script will create an IFrame so that you can see it working. It loads the target account into the frame and then clicks the required elements to unfollow the account.
