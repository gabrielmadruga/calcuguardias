{
  id: _.uniqueId(),
  fields: {
    name: {
      value: "Declaratoria de la Independencia.",
      label: "Nombre",
      type: "text",
    },
    type: {
      type: "radioGroup",
      selectedOption: 1,
      options: [
        {
          label: "Por Horario",
        },
        { label: "Por Día" },
        { label: "Fin de Semana" },
      ],
    },
    day: {
      value: "2020-08-25",
      label: "Día",
      type: "date",
      visible: true,
    },
    valueType: {
      type: "radioGroup",
      selectedOption: 0,
      options: [
        {
          label: "Aditivo",
        },
        { label: "Multiplicativo" },
      ],
    },
  },
},
{
  id: _.uniqueId(),
  fields: {
    name: {
      value: "Descubrimiento de América / Día de la Raza.",
      label: "Nombre",
      type: "text",
    },
    type: {
      type: "radioGroup",
      selectedOption: 1,
      options: [
        {
          label: "Por Horario",
        },
        { label: "Por Día" },
        { label: "Fin de Semana" },
      ],
    },
    day: {
      value: "2020-10-12",
      label: "Día",
      type: "date",
      visible: true,
    },
    valueType: {
      type: "radioGroup",
      selectedOption: 0,
      options: [
        {
          label: "Aditivo",
        },
        { label: "Multiplicativo" },
      ],
    },
  },
},
{
  id: _.uniqueId(),
  fields: {
    name: {
      value: "Día de los Difuntos.",
      label: "Nombre",
      type: "text",
    },
    type: {
      type: "radioGroup",
      selectedOption: 1,
      options: [
        {
          label: "Por Horario",
        },
        { label: "Por Día" },
        { label: "Fin de Semana" },
      ],
    },
    day: {
      value: "2020-11-02",
      label: "Día",
      type: "date",
      visible: true,
    },
    valueType: {
      type: "radioGroup",
      selectedOption: 0,
      options: [
        {
          label: "Aditivo",
        },
        { label: "Multiplicativo" },
      ],
    },
  },
},
{
  id: _.uniqueId(),
  fields: {
    name: {
      value: "Navidad o Día de la Familia.",
      label: "Nombre",
      type: "text",
    },
    type: {
      type: "radioGroup",
      selectedOption: 1,
      options: [
        {
          label: "Por Horario",
        },
        { label: "Por Día" },
        { label: "Fin de Semana" },
      ],
    },
    day: {
      value: "2020-12-25",
      label: "Día",
      type: "date",
      visible: true,
    },
    valueType: {
      type: "radioGroup",
      selectedOption: 0,
      options: [
        {
          label: "Aditivo",
        },
        { label: "Multiplicativo" },
      ],
    },
  },
},