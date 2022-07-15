//echo header
print(
  '<?xml version="1.0" encoding="utf-8"?>\n' +
    '<sphinx:docset>\n' +
    '    <sphinx:schema>\n' +
    '      <sphinx:field name="content"/>\n' +
    '      <sphinx:attr name="mongoId" type="string"/>\n' +
    '    </sphinx:schema>\n',
);

//echo postings
let index = 1;
db.postings.find({ content: { $exists: true } }).forEach(function (posting) {
  print(
    '<sphinx:document id="' +
    index  +
      '">\n' +
      '    <content>' +
    (posting.content && posting.content.toString().replace(/[><]/g, '')) +
      ' ' +
    (posting.title && posting.title.toString().replace(/[><]/g, '')) +
      '</content>\n' + //обязательно убирайте символы < и >
      '<mongoId>' +
      posting._id +
      '</mongoId>\n' +
      '</sphinx:document>',
  );
  index += 1;
});

print('</sphinx:docset>');
