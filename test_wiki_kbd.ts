import { WikiEquipmentEnricher } from './src/utils/WikiEquipmentEnricher.js';
WikiEquipmentEnricher.getInstance().enrichMonster('King Black Dragon').then(res => {
    console.log(res.rawVariables);
});
