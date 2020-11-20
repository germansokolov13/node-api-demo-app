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
db.postings.find().forEach(function (posting) {
  print(
    '<sphinx:document id="' +
      index +
      1 +
      '">\n' +
      '    <content>' +
      posting.content.toString().replace(/[><]/g, '') +
      ' ' +
      posting.title.toString().replace(/[><]/g, '') +
      '</content>\n' + //обязательно убирайте символы < и >
      '<mongoId>' +
      posting._id +
      '</mongoId>' +
      '</sphinx:document>\n',
  );
  index += 1;
});

print('</sphinx:docset>');
