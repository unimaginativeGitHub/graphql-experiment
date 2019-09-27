const {
  GraphQLSchema,
  GraphQLObjectType,
  GraphQLString,
  GraphQLList,
  GraphQLInt,
} = require('graphql');
const fetch = require('node-fetch');
const util = require('util');

const parseXML = util.promisify(require('xml2js').parseString)

const grabGoodReads = (entity, id) => `https://goodreads.com/${entity}/show/${id}?key=aCRhj2r5RxNoYUkAQTUTw`;

const BookType = new GraphQLObjectType({
  name: 'Book',
  description: '...',

  fields: {
    title: {
      type: GraphQLString,
      resolve: ({ GoodreadsResponse: { book } }) => book[0].title[0],
    },
    isbn: {
      type: GraphQLString,
      resolve: ({ GoodreadsResponse: { book } }) => book[0].isbn[0],
    },
    published: {
      type: GraphQLString,
      resolve: ({ GoodreadsResponse: { book } }) => book[0].publication_year[0],
    }
  }
});

const AuthorType = new GraphQLObjectType({
  name: 'Author',
  description: '...',

  fields: () => ({
    name: {
      type: GraphQLString,
      resolve: (xml) => xml.GoodreadsResponse.author[0].name[0],
    },
    books: {
      type: GraphQLList(BookType),
      resolve: (xml) => {
        console.log('retrieving books for selected author');
        const ids = xml.GoodreadsResponse.author[0].books[0].book.map(elem => elem.id[0]._);
        return Promise.all(ids.map(id => fetch(grabGoodReads('book', id))
          .then(response => response.text())
          .then(parseXML)
        ));
      },
    },
  }),
});

module.exports = new GraphQLSchema({
  query: new GraphQLObjectType({
    name: 'Query',
    description: '...',

    fields: () => ({
      author: {
        type: AuthorType,
        args: {
          id: { type: GraphQLInt },
        },
        resolve: (root, args) => fetch(grabGoodReads('author', args.id))
          .then(response => response.text())
          .then(parseXML),
      },
    }),
  }),
});
