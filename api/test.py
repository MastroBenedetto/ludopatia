def handler(request):
    # endpoint di sanity-check minimale: non fa import esterni
    return {
        "statusCode": 200,
        "headers": {"Content-Type": "application/json"},
        "body": '{"ok": true, "msg": "health check OK"}'
    }