
import { BankLimb } from '../src/limbs/logical/BankLimb.js';
import { Item } from '../src/core/models.js';

async function testBankCapacity() {
    console.log('--- BANK CAPACITY STRESS TEST ---');
    const bank = BankLimb.getInstance();
    
    console.log(`Max Capacity: ${BankLimb.MAX_CAPACITY}`);
    
    const items: Item[] = [];
    for (let i = 0; i < 1500; i++) {
        items.push({ id: i, itemName: `Item ${i}`, amount: 1 });
    }
    
    bank.setItems(items);
    console.log(`Bank size after 1500 items: ${bank.getItems().length}`);
    
    if (bank.getItems().length === 1500) {
        console.log('SUCCESS: Bank capacity verified at 1500 slots.');
    } else {
        console.error('FAILURE: Bank capacity mismatch.');
    }
}

testBankCapacity().catch(console.error);
