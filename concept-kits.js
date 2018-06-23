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
    format({ subject, object, concept }) {
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
          `understands that ${object} comes from ${concept}`,
          `gets ${object} via ${concept}`
        ]);
      }
    }
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
    format({ subject, object }) {
      return useReceivers
        ? `things ${concept} makes you want`
        : `things that make you want to ${concept.toLowerCase()}`;
    }
  },
  CreatedBy: {
    format({ subject, object }) {
      return useReceivers
        ? `creators of ${concept}`
        : `creations of ${concept}`;
    }
  },
  DefinedAs: {
    format({ subject, object }) {
      return useReceivers
        ? `definitions of ${concept}`
        : `things defined as ${concept}`;
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
    format({ subject, object }) {
      return useReceivers
        ? `first steps of ${concept}`
        : `things that ${concept} is a first step of`;
    }
  },
  HasLastSubevent: {
    disallowUseEmitters: true, // Only works in the `concept =relation=> receivers` direction
    format({ subject, object }) {
      return useReceivers
        ? `final steps of ${concept}`
        : `things that ${concept} is the final step of`;
    }
  },
  HasPrerequisite: {
    disallowUseEmitters: true,
    format({ subject, object }) {
      return useReceivers
        ? `prerequisites of ${concept}`
        : `things that ${concept} is a prerequisite for`;
    }
  },
  HasProperty: {
    format({ subject, object }) {
      return useReceivers ? `properties of ${concept}` : `${concept} things`;
    }
  },
  HasSubevent: {
    disallowUseEmitters: true,
    format({ subject, object }) {
      return useReceivers
        ? `steps of ${concept}`
        : `things that ${concept} is a step of`;
    }
  },
  InstanceOf: {
    format({ subject, object }) {
      return useReceivers
        ? `classifications of ${concept}`
        : `instances of ${concept}`;
    }
  },
  // IsA: {
  // format({ subject, object }) {
  // return useReceivers ? `${concept}` : `${concept} things`;
  // }
  // }
  MadeOf: {
    format({ subject, object }) {
      return useReceivers
        ? `${concept} materials`
        : `things made of ${concept}`;
    }
  },
  // MannerOf: {
  // format({ subject, object }) {
  // return useReceivers ? `way to ${concept}` : `things is a way to ${concept}`;
  // }
  // }
  MotivatedByGoal: {
    disallowUseEmitters: true,
    format({ subject, object }) {
      return useReceivers
        ? `motivations of ${concept}`
        : `things motivated by ${concept}`;
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
    format({ subject, object }) {
      return useReceivers
        ? `influences of ${concept}`
        : `things influenced by ${concept}`;
    }
  }
};

var table = probable.createTableFromSizes([
  [2, 'AtLocation'],
  [2, 'CapableOf'],
  [2, 'Causes'],
  [2, 'HasA'],
  [2, 'PartOf'],
  [2000, 'UsedFor']
]);

module.exports = {
  kitsByName,
  pickRandomRelationship: table.roll
};
