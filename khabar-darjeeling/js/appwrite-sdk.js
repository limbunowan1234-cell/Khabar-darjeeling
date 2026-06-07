<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><title>Test</title></head>
<body>
<h1>Appwrite test</h1>
<div id="out">loading...</div>
<script src="/js/appwrite-sdk.js"></script>
<script>
  try {
    const client = new Appwrite.Client().setEndpoint('https://nyc.cloud.appwrite.io/v1').setProject('khabardarjeeling');
    document.getElementById('out').textContent = 'Appwrite loaded OK! Version: ' + Appwrite;
    // try to fetch 1 article
    const db = new Appwrite.Databases(client);
    db.listDocuments('Khabar_db','articles',[Appwrite.Query.limit(1)]).then(r=>{
      document.getElementById('out').textContent += ' | Articles: ' + r.total;
    }).catch(e=>{ document.getElementById('out').textContent += ' | DB error: '+e.message });
  } catch(e) {
    document.getElementById('out').textContent = 'FAILED: '+e;
  }
</script>
</body>
</html>