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
          `know that ${subject} can ${concept}`,
          `use ${subject} to ${concept}`
        ]);
      } else {
        return pick([
          `know that ${concept} can ${object}`,
          `use ${object} to ${concept}`
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
          `pay attention to the ${subject} *and* its ${concept}`,
          `use ${subject} to get ${concept}`,
          `eat around the ${concept} in ${subject}`
        ]);
      } else {
        return pick([
          `treasure the ${object} from ${concept}`,
          `${pick(['destroy', 'smash', 'crush'])} ${object} in ${concept}`
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
          `replace ${subject} in every ${concept}`,
          `visit ${subject} whenever they are in ${concept}`
        ]);
      } else {
        return pick([
          `strip the ${concept} from the ${object}`,
          `act like ${concept} whenever they are in ${object}`
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
          `never ${concept} without ${subject}`,
          `use ${subject} to ${concept}`
        ]);
      } else {
        return pick([
          `help ${concept} with ${object}`,
          `get new ${concept} every time they ${object}`
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
          `respect both ${subject} *and* ${concept}`
        ]);
      } else {
        return pick([
          `${object} because ${concept}`,
          `experience ${concept}, then ${object}`,
          `respect both ${object} *and* ${concept}`
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
        return pick([`support ${concept} to grow the ${subject} community`]);
      } else {
        return pick([
          `hire ${object} to make ${concept}`,
          `empower ${object} to make ${concept}`,
          `respect both ${object} and ${concept}`
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
          `get the connection between ${subject} and ${concept}`,
          `recognize that ${subject} is, in ${pick([
            'truth',
            'fact',
            'actuality',
            'reality',
            'essence'
          ])}, ${concept}`
        ]);
      } else {
        return pick([
          `understand ${concept} is ${object}`,
          `deny that ${concept} is ${object}`,
          `see ${concept} can be ${object}`,
          `favor ${concept} as the ${object}`
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
          `get the connection between ${subject} and ${concept}`,
          `${subject} to bring about ${concept}`
        ]);
      } else {
        return pick([`${concept} to ${object}`]);
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
      `understand that ${concept} comes from ${subject}`,
      `${subject} to get ${concept}`
    ]);
  } else {
    return pick([
      `${concept} in order to ${object}`,
      `get ${object} via ${concept}`
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
    return pick([`${concept} before ${subject}`]);
  } else {
    return pick([`remember to ${object} when they ${concept}`]);
  }
}

function prerequisiteStyleFormat({ subject, object, concept }) {
  if (!subject && !object) {
    return formatSingleConcept(concept);
  }
  if (subject) {
    return pick([`put ${concept} before ${subject}`, `${concept}, ${subject}`]);
  } else {
    return pick([`understand you can't ${concept} without ${object}`]);
  }
}

function identityStyleFormat({ subject, object, concept }) {
  if (!subject && !object) {
    return formatSingleConcept(concept);
  }
  if (subject) {
    return pick([
      `get the connection between ${concept} and ${subject}`,
      `see that ${concept} are ${subject}`,
      `recognize that ${subject} is, in truth, ${concept}`
    ]);
  } else {
    return pick([
      `understand ${concept} is ${object}`,
      `see ${object} as ${concept}`
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
  [8, 'AtLocation'],
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
