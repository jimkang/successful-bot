var probable = require('probable');
var pick = probable.pickFromArray;

var kitsByName = {
  AtLocation: {
    format({ subject, object }) {
      if (!subject || !object) {
        return;
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
        return;
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
        return;
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
          `destroys ${object} in ${concept}`
        ]);
      }
    }
  },
  PartOf: {
    format({ subject, object, concept }) {
      if (!subject && !object) {
        return;
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
        return;
      }
      if (subject) {
        return pick([
          `never does ${concept} without ${subject}`,
          `uses the best ${subject} to ${concept}`
        ]);
      } else {
        return pick([
          `helps ${concept} ${object}`,
          `gets new ${concept} every time they ${object}`
        ]);
      }
    }
  },
  CausesDesire: {
    format({ subject, object, concept }) {
      if (!subject && !object) {
        return;
      }
      if (subject) {
        return pick([
          `want to ${concept}`,
          `${concept} to deal with their ${subject}`
        ]);
      } else {
        return pick([
          `${object} because ${concept}`,
          `${object}`,
          `experience ${concept}, then ${object}`
        ]);
      }
    }
  },
  CreatedBy: {
    format({ subject, object, concept }) {
      if (!subject && !object) {
        return;
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
    format({ subject, object, concept }) {
      if (!subject && !object) {
        return;
      }
      if (subject) {
        return pick([`recognizes that ${concept} is, in truth, ${subject}`]);
      } else {
        return pick([`sees ${object} as ${concept}`]);
      }
    }
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
  HasProperty: {},
  HasSubevent: {
    format: whileStyleFormat
  },
  InstanceOf: {},
  // IsA: {
  // format({ subject, object }) {
  // return useReceivers ? `${concept}` : `${concept} things`;
  // }
  // }
  MadeOf: {},
  // MannerOf: {
  // format({ subject, object }) {
  // return useReceivers ? `way to ${concept}` : `things is a way to ${concept}`;
  // }
  // }
  MotivatedByGoal: {},
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
  dbpedia_influencedBy: {}
};

function causalStyleFormat({ subject, object, concept }) {
  if (!subject && !object) {
    return;
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
    return;
  }
  if (subject) {
    return pick([`does ${concept} when ${subject}`]);
  } else {
    return pick([`${object} while they ${concept}`]);
  }
}

function sequentialStyleFormat({ subject, object, concept }) {
  if (!subject && !object) {
    return;
  }
  if (subject) {
    return pick([`does ${concept} before ${subject}`]);
  } else {
    return pick([`remembers to ${object} when they ${concept}`]);
  }
}

function prerequisiteStyleFormat({ subject, object, concept }) {
  if (!subject && !object) {
    return;
  }
  if (subject) {
    return pick([
      `puts ${concept} before ${subject}`,
      `knows you gotta ${concept} to ${subject}`
    ]);
  } else {
    return pick([`understands you can't ${concept} without ${object}`]);
  }
}

var table = probable.createTableFromSizes([
  [2, 'AtLocation'],
  [2, 'CapableOf'],
  [2, 'Causes'],
  [2, 'HasA'],
  [2, 'PartOf'],
  [2, 'UsedFor'],
  [2, 'CausesDesire'],
  [2, 'CreatedBy'],
  [2, 'DefinedAs'],
  [2, 'HasLastSubevent'],
  [2, 'HasFirstSubevent'],
  [2, 'HasSubevent'],
  [2000, 'HasPrerequisite']
]);

module.exports = {
  kitsByName,
  pickRandomRelationship: table.roll
};
