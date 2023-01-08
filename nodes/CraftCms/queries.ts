// ----------------------------------
//             queries
// ----------------------------------
export const getFullSchema = `
	query IntrospectionQuery {
		__schema {
			queryType { name }
			mutationType { name }
			types {
				...FullType
			}
			directives {
				name
				description
				locations
				args {
					...InputValue
				}
			}
		}
	}
	fragment FullType on __Type {
		kind
		name
		description
		fields(includeDeprecated: true) {
			name
			description
			args {
				...InputValue
			}
			type {
				...TypeRef
			}
			isDeprecated
			deprecationReason
		}
		inputFields {
			...InputValue
		}
		interfaces {
			...TypeRef
		}
		enumValues(includeDeprecated: true) {
			name
			description
			isDeprecated
			deprecationReason
		}
		possibleTypes {
			...TypeRef
		}
	}
	fragment InputValue on __InputValue {
		name
		description
		type { ...TypeRef }
		defaultValue
	}
	fragment TypeRef on __Type {
		kind
		name
		ofType {
			kind
			name
			ofType {
				kind
				name
				ofType {
					kind
					name
					ofType {
						kind
						name
						ofType {
							kind
							name
							ofType {
								kind
								name
								ofType {
									kind
									name
								}
							}
						}
					}
				}
			}
		}
	}
`;

// Get Schema of the string in $name variable eg "Query" "Mutation"
export const getSchemaName = `
	query getSchemaName($name: String!) {
		__type(name: $name) {
			name
			fields {
				name
				args {
					name
					kind
					type {
						name
						kind
						ofType {
							name
							kind
						}
					}
				}
				type {
					...TypeRef
				}
			}
		}
	}

	fragment TypeRef on __Type {
		kind
		name
		ofType {
			kind
			name
			ofType {
				kind
				name
				ofType {
					kind
					name
					ofType {
						kind
						name
						ofType {
							kind
							name
							ofType {
								kind
								name
								ofType {
									kind
									name
								}
							}
						}
					}
				}
			}
		}
	}
`;
