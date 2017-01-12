// allowes to use SimpleSchema.RegEx.Email keys in the translation file, instead of the actual regex
export default function evalSimpleSchemaRegexKeys(messages) {
  if (messages && messages.regEx) {
    const regEx = messages.regEx.map(
      ({ msg, exp }) => ({
        msg,
        exp: exp && exp.split('.').reduce((o, i) => (o && o[i]), global),
      }),
    );
    return { ...messages, regEx };
  }
  return messages;
}
