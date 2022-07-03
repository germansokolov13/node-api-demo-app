FROM mongo:5.0.9-focal

RUN apt-get update && apt-get install -y \
    sphinxsearch \
    cron \
    wget

#RUN wget https://sphinxsearch.com/files/sphinx-3.4.1-efbcc65-linux-amd64-musl.tar.gz -O /tmp/sphinxsearch.tar.gz \
#    && mkdir /opt/sphinx \
#	&& tar -xf /tmp/sphinxsearch.tar.gz -C /opt/sphinx \
#	&& rm /tmp/sphinxsearch.tar.gz
#
#ENV PATH "${PATH}:/opt/sphinx/sphinx-3.4.1/bin"

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

CMD indexer -c /etc/sphinxsearch/sphinx.conf --all \
   && cron \
   && searchd -c /etc/sphinxsearch/sphinx.conf --nodetach "$@"
