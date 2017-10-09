import fetch from "isomorphic-fetch";
import { makeExecutableSchema } from 'graphql-tools';
import _ from 'lodash';

const typeDefs = `
  type Query {
    movies: [Movie],
		movie(id: String): Movie
  }

	type Movie {
		id: String,
		title: String,
		description: String,
		director: String,
		genres: [String],
		rating: String,
		recommended: Boolean,
		releaseDate: String,
		playTime: String,
		poster: Poster,
	}

	type Poster {
		uri: String
	}
`;

const MOVIES_URI = "http://www.mocky.io/v2/59db747c0f00009e0602a777";
const POSTER_URI = "https://api.themoviedb.org/3/find/";
const POSTER_SOURCE = "https://image.tmdb.org/t/p/w300";

const resolvers = {
  Query: {
    movies: (root, args, context) => {
      return fetch(MOVIES_URI).then(response => response.json());
    },
    movie: (root, args, context) => {
      return fetch(MOVIES_URI)
        .then(response => response.json())
      	.then(data => {
        	return _.find(data, {id: args.id});
      	});
    },
  },
  Movie: {
    poster: (root, args, context) => {
      const URL = `${POSTER_URI}${root.id}?api_key=${context.secrets.moviedb}&language=en-US&external_source=imdb_id`;
      return fetch(URL)
        .then(response => response.json())
      	.then(data => {
        	return {
            uri: `${POSTER_SOURCE}${data.movie_results[0]['poster_path']}`
          };
      	});
    },
    recommended: (root, args, context) => {
      return root.genres.indexOf('Action') !== -1;
    }
  }
};

// Required: Export the GraphQL.js schema object as "schema"
export const schema = makeExecutableSchema({
  typeDefs,
  resolvers,
});

// Optional: Export a function to get context from the request. It accepts two
// parameters - headers (lowercased http headers) and secrets (secrets defined
// in secrets section). It must return an object (or a promise resolving to it).
export function context(headers, secrets) {
  return {
    headers,
    secrets,
  };
};
