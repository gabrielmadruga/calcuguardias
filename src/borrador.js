function reducer(state, action) {
  switch (action.type) {
    case "add_guardia":
      state.guardias.push(action.data);
      break;
    case "edit_guardia":
      const index = _.findIndex(
        state.guardias,
        (guardia) => guardia.id === action.data.id
      );
      state.guardias[index] = action.data;
      break;
    default:
      throw new Error();
  }
}

const [state, dispatch] = React.useReducer(produce(reducer), initialState);
