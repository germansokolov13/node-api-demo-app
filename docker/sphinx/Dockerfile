FROM mongo:5.0.9-focal

RUN apt-get update && apt-get install -y \
    sphinxsearch \
    cron

RUN mkdir -p /usr/local/var/data/ \
  && mkdir -p /usr/local/var/log/ \
  && mkdir -p /usr/local/bin/ \
  && mkdir -p /usr/local/sphinx/var/ \
  && chmod 755 /usr/local/var/data/ \
  && chmod 755 /usr/local/var/log/ \
  && ln -s /usr/local/var/log/ /usr/local/sphinx/var/log \
  && ln -s /usr/local/var/data/ /usr/local/sphinx/var/data \
  && ln -s /usr/bin/searchd /usr/local/bin/searchd

ADD crontab /etc/cron.d/crontab
RUN chmod 0644 /etc/cron.d/crontab \
  && crontab /etc/cron.d/crontab \
  && touch /var/log/sphinx_cron.log

ADD sphinx.conf /etc/sphinxsearch/sphinx.conf
ADD postings-indexer.js /etc/sphinxsearch/postings-indexer.js
ADD update-index.sh /etc/sphinxsearch/update-index.sh
ADD get-xml.sh /etc/sphinxsearch/get-xml.sh
RUN chmod +x /etc/sphinxsearch/get-xml.sh

CMD indexer -c /etc/sphinxsearch/sphinx.conf --all \
   && cron \
   && searchd -c /etc/sphinxsearch/sphinx.conf --nodetach "$@"
