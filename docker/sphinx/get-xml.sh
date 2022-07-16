bash -c  "mongosh --authenticationDatabase admin -u $SOURCE_USER -p $SOURCE_PASSWORD --host mongo '$SOURCE_DB' --quiet /etc/sphinxsearch/postings-indexer.js"
