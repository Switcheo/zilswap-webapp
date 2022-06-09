import { TraitType, TraitTypeWithSelection } from "app/store/types";
import { SimpleMap } from "app/utils";


const mapToSelectableTraits = (traits: SimpleMap<TraitType>): SimpleMap<TraitTypeWithSelection> => {
  const traitWithSelection: SimpleMap<TraitTypeWithSelection> = {}
  for (const x in traits) {
    traitWithSelection[x] = { trait: traits[x].trait, values: {} }
    for (const y in traits[x].values) {
      traitWithSelection[x].values[y] = { ...traits[x].values[y], selected: false }
    }
  }
  return traitWithSelection;
}

export default mapToSelectableTraits;
