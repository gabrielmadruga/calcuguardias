import React from "react";
import produce from "immer";
import _ from "lodash";
import cx from "classnames";
import moment from "moment";
import "./App.css";

import { monthEarnings } from "./core";

function Field({
  label,
  value,
  onChange,
  onFocus,
  onBlur,
  type,
  editable,
  numberProps,
}) {
  const labelId = React.useRef(_.uniqueId());
  const inputId = React.useRef(_.uniqueId());

  return (
    <div className="form-group row mb-2">
      <label
        id={labelId.current}
        htmlFor={inputId.current}
        className="col-sm-2 col-form-label"
      >
        {label}
      </label>
      <div className="col-sm-10">
        <input
          type={type}
          id={inputId.current}
          readOnly={!editable}
          className={cx({
            "form-control": editable,
            "form-control-plaintext": !editable,
          })}
          aria-labelledby={labelId.current}
          aria-describedby="inputGroup-sizing-default"
          value={value}
          onChange={onChange}
          onFocus={onFocus}
          onBlur={onBlur}
          {...numberProps}
        />
      </div>
    </div>
  );
}

function Hora({ data, onChange, onDelete }) {
  return (
    <div>
      {_.map(data.fields, (field, key) => (
        <Field
          key={key}
          type={field.type}
          numberProps={field.type === "number" ? { min: 0, step: 0.1 } : null}
          label={field.label}
          value={field.value}
          onChange={(event) => onChange(key, event.target.value)}
          editable
        />
      ))}
      <button onClick={onDelete}>Eliminar</button>
    </div>
  );
}

function Guardia({ data, onEditClick }) {
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
      }}
    >
      {_.map(data.fields, (field, key) => (
        <Field
          key={key}
          type={field.type}
          label={field.label}
          value={field.value}
        />
      ))}
      <button type="button" onClick={onEditClick}>
        Editar
      </button>
    </form>
  );
}

function GuardiaEditor({ data, onChange, onBlur }) {
  const [focused, setFocused] = React.useState(null);
  const stateRef = React.useRef(focused);
  stateRef.current = focused;
  const timeoutRef = React.useRef();

  function onFieldFocus(field) {
    setFocused(field);
  }

  function onFieldBlur() {
    setFocused(null);
    if (onChange && onBlur) {
      timeoutRef.current = setTimeout(() => {
        if (!stateRef.current) {
          onBlur();
        }
      }, 100);
    }
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        clearTimeout(timeoutRef.current);
        onBlur();
      }}
    >
      {_.map(data.fields, (field, key) => (
        <Field
          key={key}
          type={field.type}
          label={field.label}
          value={field.value}
          onChange={(event) => onChange(key, event.target.value)}
          onFocus={() => onFieldFocus(key)}
          onBlur={onFieldBlur}
          editable={onChange}
        />
      ))}
      <button onFocus={() => setFocused("button")}>Guardar</button>
    </form>
  );
}

function Bono() {
  return <div>TODO</div>;
}

function App() {
  const [horas, setHoras] = React.useState([]);
  const [guardias, setGuardias] = React.useState([]);
  const [newGuardia, setNewGuardia] = React.useState(null);
  const [editingGuardia, setEditingGuardia] = React.useState(null);

  const [bonos, setBonos] = React.useState([]);

  function onAgregarHoraClick() {
    setHoras(
      produce((horas) => {
        horas.push({
          id: _.uniqueId(),
          fields: {
            type: { value: "", label: "Tipo", type: "text" },
            value: { value: 200, label: "Valor", type: "number" },
          },
        });
      })
    );
  }

  function onHoraChange(id, key, value) {
    const index = _.findIndex(horas, (hora) => hora.id === id);
    setHoras(
      produce((horas) => {
        horas[index].fields[key].value = value;
      })
    );
  }

  function onAgregarGuardiaClick() {
    setNewGuardia({
      id: _.uniqueId(),
      fields: {
        name: { value: "", label: "Nombre", type: "text" },
        startDateTime: {
          value: moment().minutes(0).format(moment.HTML5_FMT.DATETIME_LOCAL),
          label: "Fecha de Inicio",
          type: "datetime-local",
        },
        duration: { value: 8, label: "Duración", type: "number" },
      },
    });
  }

  function onNewGuardiaChange(key, value) {
    setNewGuardia(
      produce((guardia) => {
        guardia.fields[key].value = value;
      })
    );
  }

  function onEditingGuardiaChange(key, value) {
    setEditingGuardia(
      produce((guardia) => {
        guardia.fields[key].value = value;
      })
    );
  }

  function onEditingGuardiaBlur(isNew) {
    if (isNew) {
      setGuardias(
        produce((guardias) => {
          guardias.push(newGuardia);
        })
      );
      setNewGuardia(null);
    } else {
      const index = _.findIndex(
        guardias,
        (guardia) => guardia.id === editingGuardia.id
      );
      setGuardias(
        produce((guardias) => {
          guardias[index] = editingGuardia;
        })
      );
      setEditingGuardia(null);
    }
  }

  return (
    <div className="App">
      <header className="App-header">
        <h1>Calcuguardias</h1>
      </header>
      <main>
        <section>
          <h1>Horas</h1>
          {_.map(horas, (hora, i) => (
            <Hora
              key={i}
              data={hora}
              onChange={(key, value) => onHoraChange(hora.id, key, value)}
              onDelete={() =>
                setHoras(
                  produce((horas) => {
                    _.remove(horas, (h) => h.id === hora.id);
                  })
                )
              }
            />
          ))}
          <button onClick={onAgregarHoraClick}>Agregar Hora</button>
        </section>
        <section>
          <h1>Guardias</h1>
          {_.map(guardias, (guardia, i) =>
            editingGuardia && guardia.id === editingGuardia.id ? (
              <GuardiaEditor
                key={i}
                data={editingGuardia}
                onChange={onEditingGuardiaChange}
                onBlur={() => onEditingGuardiaBlur(false)}
              />
            ) : (
              <Guardia
                key={i}
                data={guardia}
                onEditClick={() => setEditingGuardia(guardia)}
              />
            )
          )}
          {newGuardia ? (
            <GuardiaEditor
              data={newGuardia}
              onChange={onNewGuardiaChange}
              onBlur={() => onEditingGuardiaBlur(true)}
            />
          ) : (
            !editingGuardia && (
              <button onClick={onAgregarGuardiaClick}>Agregar Guardia</button>
            )
          )}
        </section>
        <section>
          <h1>Bonos</h1>
          {_.map(bonos, (bono, i) => (
            <Bono key={i} data={bono} />
          ))}
        </section>
        <section>
          <h1>Sueldo</h1>
          <p>{monthEarnings(moment().month(), guardias, 200, [])}</p>
        </section>
      </main>
    </div>
  );
}

export default App;
