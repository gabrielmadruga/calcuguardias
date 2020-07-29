import React from "react";
import { Tab, Tabs, TabList, TabPanel } from "react-tabs";
import "react-tabs/style/react-tabs.css";
import produce from "immer";
import _ from "lodash";
import cx from "classnames";
import moment from "moment";
import "./App.css";
import { useLocalStorageState } from "./utils";
import { monthEarnings } from "./core";

const feriados = [
  {
    name: "Declaratoria de la Independencia.",
    date: "2020-08-25",
  },
  {
    name: "Descubrimiento de América / Día de la Raza.",
    date: "2020-10-12",
  },
  {
    name: "Día de los Difuntos.",
    date: "2020-11-02",
  },
  {
    name: "Navidad o Día de la Familia.",
    date: "2020-12-25",
  },
];

function Field(props) {
  const {
    label,
    value,
    onChange,
    type,
    editable,
    numberProps,
    optionsProp,
    selectedOption,
    options,
  } = props;

  const labelId = React.useRef(_.uniqueId());
  const inputId = React.useRef(_.uniqueId());
  if (type === "select") {
    return (
      <div className="Field">
        <label
          id={labelId.current}
          htmlFor={inputId.current}
          className="col-sm-2 col-form-label"
        >
          {label}
        </label>
        <select
          id={inputId.current}
          readOnly={!editable}
          className={cx({
            "form-control": editable,
            "form-control-plaintext": !editable,
          })}
          aria-labelledby={labelId.current}
          value={value}
          onChange={onChange}
        >
          {_.map(props[optionsProp], (optionData) => (
            <option value={optionData.id} key={optionData.id}>
              {optionData.fields.name.value}
            </option>
          ))}
        </select>
      </div>
    );
  }

  if (type === "radioGroup") {
    return (
      <div className="Field">
        {_.map(options, (option, i) => (
          <div className="RadioGroupItem" key={i}>
            <label
              id={labelId.current}
              htmlFor={inputId.current}
              className="col-sm-2 col-form-label"
            >
              {option.label}
            </label>
            <input
              type="radio"
              id={inputId.current}
              readOnly={!editable}
              aria-labelledby={labelId.current}
              value={i}
              onChange={onChange}
              checked={selectedOption === i}
            />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="Field">
      <label
        id={labelId.current}
        htmlFor={inputId.current}
        className="col-sm-2 col-form-label"
      >
        {label}
      </label>
      <input
        type={type}
        id={inputId.current}
        readOnly={!editable}
        className={cx({
          "form-control": editable,
          "form-control-plaintext": !editable,
        })}
        aria-labelledby={labelId.current}
        value={value}
        onChange={onChange}
        {...numberProps}
      />
    </div>
  );
}

function Hora({ data, onChange, onDelete }) {
  return (
    <div className="Hora">
      <div className="FieldList">
        {_.map(data.fields, (field, key) => (
          <Field
            key={key}
            {...field}
            onChange={(event) => onChange(key, event.target.value)}
            editable
          />
        ))}
      </div>
      <button disabled={!onDelete} onClick={onDelete}>
        Eliminar
      </button>
    </div>
  );
}

function Guardia({ data, horas, onChange, onDelete }) {
  return (
    <div className="Guardia">
      <div className="FieldList">
        {_.map(data.fields, (field, key) => (
          <Field
            key={key}
            {...field}
            onChange={(event) => onChange(key, event.target.value)}
            editable={onChange}
            horas={horas}
          />
        ))}
      </div>
      <button disabled={!onDelete} onClick={onDelete}>
        Eliminar
      </button>
    </div>
  );
}

function Bono({ data, onChange, onDelete }) {
  return (
    <div className="Bono">
      <div className="FieldList">
        {_.map(
          _.pickBy(data.fields, (f) => _.isUndefined(f.visible) || f.visible),
          (field, key) => (
            <Field
              key={key}
              {...field}
              onChange={(event) => onChange(key, event.target.value)}
              editable={onChange}
            />
          )
        )}
      </div>
      <button onClick={onDelete}>Eliminar</button>
    </div>
  );
}

function App() {
  const [horas, setHoras] = useLocalStorageState(
    [
      {
        id: _.uniqueId(),
        fields: {
          name: { value: "Guardia", label: "Nombre", type: "text" },
          value: {
            value: 200,
            label: "Valor",
            type: "number",
            numberProps: { min: 0, step: 0.1 },
          },
        },
      },
    ],
    "horas"
  );
  const [guardias, setGuardias] = useLocalStorageState([], "guardias");

  const [bonos, setBonos] = useLocalStorageState(
    _.map(feriados, (f) => {
      return {
        id: _.uniqueId(),
        fields: {
          name: {
            value: f.name,
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
            value: f.date,
            label: "Día",
            type: "date",
            visible: true,
          },
          startHour: {
            value: 23,
            label: "Principio",
            type: "number",
            numberProps: {
              min: 0,
              max: 23,
            },
            visible: false,
          },
          endHour: {
            value: 6,
            label: "Fin",
            type: "number",
            numberProps: {
              min: 0,
              max: 23,
            },
            visible: false,
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
          value: {
            value: 100,
            label: "Valor",
            type: "number",
            numberProps: { min: 0, step: 0.1 },
          },
        },
      };
    }),
    "bonos"
  );

  function onAgregarHoraClick() {
    setHoras(
      produce((horas) => {
        horas.push({
          id: _.uniqueId(),
          fields: {
            name: { value: "", label: "Nombre", type: "text" },
            value: {
              value: 200,
              label: "Valor",
              type: "number",
              numberProps: { min: 0, step: 0.1 },
            },
          },
        });
      })
    );
  }

  function onHoraChange(id, key, value) {
    const index = _.findIndex(horas, (hora) => hora.id === id);
    setHoras(
      produce((horas) => {
        if (horas[index].fields[key].type === "number") {
          horas[index].fields[key].value = parseFloat(value);
        } else {
          horas[index].fields[key].value = value;
        }
      })
    );
  }

  function onAgregarGuardiaClick() {
    setGuardias(
      produce((guardias) => {
        guardias.push({
          id: _.uniqueId(),
          fields: {
            hour: {
              value: horas[0].id,
              label: "Tipo de Hora",
              type: "select",
              optionsProp: "horas",
            },
            startDateTime: {
              value: moment()
                .minutes(0)
                .format(moment.HTML5_FMT.DATETIME_LOCAL),
              label: "Fecha de Inicio",
              type: "datetime-local",
            },
            duration: { value: 8, label: "Duración", type: "number" },
          },
        });
      })
    );
  }

  function onGuardiaChange(id, key, value) {
    const index = _.findIndex(guardias, (guardia) => guardia.id === id);
    setGuardias(
      produce((guardias) => {
        if (guardias[index].fields[key].type === "number") {
          guardias[index].fields[key].value = parseFloat(value);
        } else {
          guardias[index].fields[key].value = value;
        }
      })
    );
  }

  function onAgregarBonoClick() {
    setBonos(
      produce((bonos) => {
        bonos.push({
          id: _.uniqueId(),
          fields: {
            name: {
              value: "",
              label: "Nombre",
              type: "text",
            },
            type: {
              type: "radioGroup",
              selectedOption: 0,
              options: [
                {
                  label: "Por Horario",
                },
                { label: "Por Día" },
                { label: "Fin de Semana" },
              ],
            },
            day: {
              value: moment().format(moment.HTML5_FMT.DATE),
              label: "Día",
              type: "date",
              visible: false,
            },
            startHour: {
              value: 23,
              label: "Principio",
              type: "number",
              numberProps: {
                min: 0,
                max: 23,
              },
              visible: true,
            },
            endHour: {
              value: 6,
              label: "Fin",
              type: "number",
              numberProps: {
                min: 0,
                max: 23,
              },
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
            value: {
              value: 100,
              label: "Valor",
              type: "number",
              numberProps: { min: 0, step: 0.1 },
            },
          },
        });
      })
    );
  }

  function onBonoChange(id, key, value) {
    const index = _.findIndex(bonos, (bono) => bono.id === id);
    setBonos(
      produce((bonos) => {
        if (bonos[index].fields[key].type === "number") {
          bonos[index].fields[key].value = parseFloat(value);
        } else if (bonos[index].fields[key].type === "radioGroup") {
          const v = parseInt(value);
          bonos[index].fields[key].selectedOption = v;
          if (key === "type") {
            bonos[index].fields.day.visible = v === 1;
            bonos[index].fields.startHour.visible = v === 0;
            bonos[index].fields.endHour.visible = v === 0;
          }
        } else {
          bonos[index].fields[key].value = value;
        }
      })
    );
  }

  return (
    <div className="App">
      <header className="App-header">
        <h1>Calcuguardias</h1>
      </header>
      <main className="App-main">
        <Tabs>
          <TabList>
            <Tab>Horas</Tab>
            <Tab>Guardias</Tab>
            <Tab>Bonos</Tab>
            <Tab>Sueldo</Tab>
          </TabList>

          <TabPanel>
            <h1>Horas</h1>
            {_.map(horas, (hora, i) => (
              <Hora
                key={i}
                data={hora}
                onChange={(key, value) => onHoraChange(hora.id, key, value)}
                onDelete={
                  _.size(horas) > 1
                    ? () => {
                        setHoras(
                          produce((horas) => {
                            _.remove(horas, (h) => h.id === hora.id);
                          })
                        );
                        setGuardias(
                          produce((guardias) => {
                            _.forEach(guardias, (guardia) => {
                              if (guardia.fields.hour.value === hora.id) {
                                guardia.fields.hour.value = horas[0].id;
                              }
                            });
                          })
                        );
                      }
                    : undefined
                }
              />
            ))}
            <button className="AgregarButton" onClick={onAgregarHoraClick}>
              Agregar Hora
            </button>
          </TabPanel>
          <TabPanel>
            <h1>Guardias</h1>
            {_.map(guardias, (guardia, i) => (
              <Guardia
                key={i}
                data={guardia}
                horas={horas}
                onChange={(key, value) =>
                  onGuardiaChange(guardia.id, key, value)
                }
                onDelete={() =>
                  setGuardias(
                    produce((guardias) => {
                      _.remove(guardias, (g) => g.id === guardia.id);
                    })
                  )
                }
              />
            ))}

            <button className="AgregarButton" onClick={onAgregarGuardiaClick}>
              Agregar Guardia
            </button>
          </TabPanel>
          <TabPanel>
            <h1>Bonos</h1>
            {_.map(bonos, (bono, i) => (
              <Bono
                key={i}
                data={bono}
                onChange={(key, value) => onBonoChange(bono.id, key, value)}
                onDelete={() =>
                  setBonos(
                    produce((bonos) => {
                      _.remove(bonos, (b) => b.id === bono.id);
                    })
                  )
                }
              />
            ))}
            <button className="AgregarButton" onClick={onAgregarBonoClick}>
              Agregar Bono
            </button>
          </TabPanel>
          <TabPanel>
            <h1>Sueldo</h1>
            <h1>$ {monthEarnings(moment().month(), guardias, horas, bonos)}</h1>
          </TabPanel>
        </Tabs>
      </main>
    </div>
  );
}

export default App;
