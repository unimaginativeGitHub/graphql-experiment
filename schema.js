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

const BookType = new GraphQLObjectType({
  name: 'Book',
  description: '...',

  fields: {
    title: {
      type: GraphQLString,
      resolve: book => book.title[0],
    },
    isbn: {
      type: GraphQLString,
      resolve: (book) => {
        if (typeof book.isbn[0] === 'string') {
          return book.isbn[0];
        } else if (typeof book.isbn13[0] === 'string') {
          return book.isbn[0];
        } else {
          return '<isbn missing>';
        }
      }
    },
    published: {
      type: GraphQLString,
      resolve: book => book.publication_year[0]
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
      resolve: (xml) => xml.GoodreadsResponse.author[0].books[0].book,
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
        resolve: (root, args) => fetch(
          `https://goodreads.com/author/show.xml?id=${args.id}&key=aCRhj2r5RxNoYUkAQTUTw`
        )
        .then(response => response.text())
        .then(parseXML), // graph ql uses to aquire the data
      },
    }),
  }),
});
