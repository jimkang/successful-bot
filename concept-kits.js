var probable = require('probable');
var pick = probable.pickFromArray;

var kitsByName = {
  AtLocation: {
    format({ subject, object, concept }) {
      if (!subject || !object) {
        return formatSingleConcept(concept);
      }
      return pick([
        `takes ${subject} to ${object}`,
        `finds ${subject} at ${object}`,
        `puts ${subject} in ${object}`,
        `gets ${subject} from ${object}`,
        `visits ${subject} at ${object}`
      ]);
    }
  },
  CapableOf: {
    format({ subject, object, concept }) {
      if (!subject && !object) {
        return formatSingleConcept(concept);
      }
      if (subject) {
        return pick([
          `knows that ${subject} can ${concept}`,
          `uses ${subject} to ${concept}`
        ]);
      } else {
        return pick([
          `knows that ${concept} can ${object}`,
          `uses ${concept} to ${object}`
        ]);
      }
    }
  },
  Causes: {
    format: causalStyleFormat
  },
  HasA: {
    format({ subject, object, concept }) {
      if (!subject && !object) {
        return formatSingleConcept(concept);
      }
      if (subject) {
        return pick([
          `pays attention to the ${subject} *and* its ${concept}`,
          `uses ${subject} to get ${concept}`,
          `eats around the ${concept} in ${subject}`
        ]);
      } else {
        return pick([
          `strips the ${object} from the ${concept}`,
          `${pick(['destroys', 'eliminates', 'crushes'])} ${object} in ${
            concept
          }`
        ]);
      }
    }
  },
  PartOf: {
    format({ subject, object, concept }) {
      if (!subject && !object) {
        return formatSingleConcept(concept);
      }
      if (subject) {
        return pick([
          `replaces ${subject} in every ${concept}`,
          `visits ${subject} whenever they are in ${concept}`
        ]);
      } else {
        return pick([
          `strips the ${concept} from the ${object}`,
          `acts like ${concept} whenever they are in ${object}`
        ]);
      }
    }
  },
  UsedFor: {
    format({ subject, object, concept }) {
      if (!subject && !object) {
        return formatSingleConcept(concept);
      }
      if (subject) {
        return pick([
          `never does ${concept} without ${subject}`,
          `uses ${subject} to ${concept}`
        ]);
      } else {
        return pick([
          `helps ${concept} with ${object}`,
          `gets new ${concept} every time they ${object}`
        ]);
      }
    }
  },
  CausesDesire: {
    format({ subject, object, concept }) {
      if (!subject && !object) {
        return formatSingleConcept(concept);
      }
      if (subject) {
        return pick([
          `want to ${concept}`,
          `${concept} to deal with their ${subject}`,
          `respects both ${subject} and ${concept}`
        ]);
      } else {
        return pick([
          `${object} because ${concept}`,
          `experience ${concept}, then ${object}`,
          `respects both ${object} and ${concept}`
        ]);
      }
    }
  },
  CreatedBy: {
    format({ subject, object, concept }) {
      if (!subject && !object) {
        return formatSingleConcept(concept);
      }
      if (subject) {
        return pick([`supports ${concept} to grow the ${subject} community`]);
      } else {
        return pick([
          `hires ${object} to make ${concept}`,
          `respects both ${object} and ${concept}`
        ]);
      }
    }
  },
  DefinedAs: {
    format: identityStyleFormat
    // format({ subject, object, concept }) {
    // if (!subject && !object) {
    // return formatSingleConcept(concept);
    // }
    // if (subject) {
    // } else {
    // }
    // // }
  },
  // DistinctFrom: {
  // format({ subject, object }) {
  // return useReceivers ? `things distinct from ${concept}` : `huh ${concept}`;
  // }
  // },
  // Entails: {
  // format({ subject, object }) {
  // return useReceivers ? `things that ${concept} entails` : `things entailed in ${concept}`;
  // }
  // }
  HasFirstSubevent: {
    format: sequentialStyleFormat
  },
  HasLastSubevent: {
    format: sequentialStyleFormat
  },
  HasPrerequisite: {
    format: prerequisiteStyleFormat
  },
  HasProperty: {
    format: identityStyleFormat
  },
  HasSubevent: {
    format: whileStyleFormat
  },
  InstanceOf: {
    format({ subject, object, concept }) {
      if (!subject && !object) {
        return formatSingleConcept(concept);
      }
      if (subject) {
        return pick([
          `gets the connection between ${subject} and ${concept}`,
          `recognizes that ${subject} is, in ${pick([
            'truth',
            'fact',
            'actuality',
            'reality',
            'essence'
          ])}, ${concept}`
        ]);
      } else {
        return pick([
          `understands ${concept} is ${object}`,
          `denies that ${concept} is ${object}`,
          `sees ${object} as ${concept}`,
          `favors ${concept} among the ${object}`
        ]);
      }
    }
  },
  // IsA: {
  // format({ subject, object }) {
  // return useReceivers ? `${concept}` : `${concept} things`;
  // }
  // }
  MadeOf: { format: identityStyleFormat },
  // MannerOf: {
  // format({ subject, object }) {
  // return useReceivers ? `way to ${concept}` : `things is a way to ${concept}`;
  // }
  // }
  MotivatedByGoal: {
    format({ subject, object, concept }) {
      if (!subject && !object) {
        return formatSingleConcept(concept);
      }
      if (subject) {
        return pick([
          `gets the connection between ${subject} and ${concept}`,
          `${subject} to ${concept}`,
          subject
        ]);
      } else {
        return pick([`does ${concept} to ${object}`, object]);
      }
    }
  },
  // NotCapableOf: {
  // format({ subject, object }) {
  // return useReceivers ? `things that ${concept} can't do` : `things that can't ${concept}`;
  // }
  // },
  // ReceivesAction: {
  // format({ subject, object }) {
  // return useReceivers ? `things done with ${concept}` : `things ${concept}`;
  // }
  // },
  //SimilarTo: {
  //SymbolOf: {
  // dbpedia_genre: {
  // lineCount: 1219,
  // format({ subject, object }) {
  // return useReceivers ? `genres ${concept} is in` : `things in the ${concept} genre`;
  // }
  // },
  dbpedia_influencedBy: {
    format({ concept }) {
      return `${pick(['worship', 'are influenced by', 'respect'])} ${concept}`;
    }
  }
};

function causalStyleFormat({ subject, object, concept }) {
  if (!subject && !object) {
    return formatSingleConcept(concept);
  }
  if (subject) {
    return pick([
      `understands that ${concept} comes from ${subject}`,
      `${subject} to get ${concept}`
    ]);
  } else {
    return pick([
      `${concept} in order to ${object}`,
      `gets ${object} via ${concept}`
    ]);
  }
}
function whileStyleFormat({ subject, object, concept }) {
  if (!subject && !object) {
    return formatSingleConcept(concept);
  }
  if (subject) {
    return pick([`${concept} when ${subject}`]);
  } else {
    return pick([`${object} while ${concept}`]);
  }
}

function sequentialStyleFormat({ subject, object, concept }) {
  if (!subject && !object) {
    return formatSingleConcept(concept);
  }
  if (subject) {
    return pick([`does ${subject} before ${concept}`]);
  } else {
    return pick([`remembers to ${object} when they ${concept}`]);
  }
}

function prerequisiteStyleFormat({ subject, object, concept }) {
  if (!subject && !object) {
    return formatSingleConcept(concept);
  }
  if (subject) {
    return pick([
      `puts ${concept} before ${subject}`,
      `${concept}, ${subject}`
    ]);
  } else {
    return pick([`understands you can't ${concept} without ${object}`]);
  }
}

function identityStyleFormat({ subject, object, concept }) {
  if (!subject && !object) {
    return formatSingleConcept(concept);
  }
  if (subject) {
    return pick([
      `gets the connection between ${concept} and ${subject}`,
      `sees that ${concept} are ${subject}`,
      `recognizes that ${subject} is, in truth, ${concept}`
    ]);
  } else {
    return pick([
      `understands ${concept} is ${object}`,
      `sees ${object} as ${concept}`,
      `favors ${concept} among the ${object}`
    ]);
  }
}

function formatSingleConcept(concept) {
  return `${pick([
    'love',
    'are innately attuned to',
    'believe in',
    'demand excellence in'
  ])} ${concept}`;
}

var table = probable.createTableFromSizes([
  [6, 'AtLocation'],
  [3, 'CapableOf'],
  [3, 'Causes'],
  [10, 'HasA'],
  [3, 'PartOf'],
  [3, 'UsedFor'],
  [3, 'CausesDesire'],
  [9, 'CreatedBy'],
  [1, 'DefinedAs'],
  [3, 'HasLastSubevent'],
  [3, 'HasFirstSubevent'],
  [3, 'HasSubevent'],
  [1, 'HasPrerequisite'],
  [3, 'HasProperty'],
  [3, 'InstanceOf'],
  [1, 'MadeOf'],
  [3, 'MotivatedByGoal'],
  [3, 'dbpedia_influencedBy']
]);

module.exports = {
  kitsByName,
  pickRandomRelationship: table.roll
};
