// Fault Database
const FAULT_DATABASE = [
  {
    type: 'electric',
    code: '361',
    title: 'Main Inverter Fault',
    loco: 'WAP-7',
    symptom: 'No traction, inverter alarm, power loss',
    fix: 'Check inverter cubicle for loose connections; inspect SCR modules for damage; verify cooling system operation; check for overheating; reset main isolator; inspect power cables; verify voltage levels.'
  },
  {
    type: 'electric',
    code: '362',
    title: 'Traction Motor Fault',
    loco: 'WAP-7',
    symptom: 'Reduced power, motor overheating, unusual noise',
    fix: 'Check motor bearings for wear; inspect carbon brushes and replace if worn; verify motor connections are tight; check for foreign objects in motor housing; inspect cooling system; measure motor temperature.'
  },
  {
    type: 'electric',
    code: '201',
    title: 'Pantograph Failure',
    loco: 'WAP-5',
    symptom: 'No power, pantograph won\'t raise, arcing',
    fix: 'Check pantograph air pressure (minimum 5 kg/cm²); inspect pantograph springs for damage; verify circuit breaker position; check OHE contact quality; inspect carbon strips; check raising/lowering mechanism.'
  },
  {
    type: 'electric',
    code: '305',
    title: 'Compressor Failure',
    loco: 'WAP-4',
    symptom: 'Low air pressure, compressor not running',
    fix: 'Check compressor motor connections; verify power supply; inspect air filters; check oil level; verify pressure switch settings; inspect non-return valve; check for air leaks in system.'
  },
  {
    type: 'diesel',
    code: 'D101',
    title: 'Engine Start Failure',
    loco: 'WDP-4',
    symptom: 'Engine won\'t start, weak cranking',
    fix: 'Check battery voltage (minimum 110V); verify fuel supply to engine; inspect starter motor brushes; check governor settings; verify fuel filters are clean; check cranking motor; inspect fuel injection system.'
  },
  {
    type: 'diesel',
    code: 'D102',
    title: 'Turbocharger Failure',
    loco: 'WDG-4',
    symptom: 'Loss of power, black smoke, high exhaust temperature',
    fix: 'Check turbocharger bearings; inspect for oil leaks; verify lubrication system; check air intake system; inspect turbine blades; verify exhaust gas temperature; clean air filters.'
  },
  {
    type: 'diesel',
    code: 'D201',
    title: 'Cooling System Fault',
    loco: 'WDP-4',
    symptom: 'Engine overheating, coolant loss',
    fix: 'Check coolant level and refill if low; inspect radiator for blockages; verify water pump operation; check thermostat; inspect hoses for leaks; clean radiator fins; check fan belt tension.'
  },
  {
    type: 'vb',
    code: 'VB01',
    title: 'Door Control Fault',
    loco: 'Vande Bharat',
    symptom: 'Doors not closing properly, door alarm',
    fix: 'Check door motor operation; verify door controller settings; inspect door sensors for obstruction; reset door control system; check pneumatic pressure; verify door lock mechanism.'
  },
  {
    type: 'vb',
    code: 'VB02',
    title: 'HVAC System Fault',
    loco: 'Vande Bharat',
    symptom: 'Air conditioning not working, temperature control failure',
    fix: 'Check compressor operation; verify refrigerant levels; inspect electrical connections to HVAC unit; reset HVAC control module; check air filters; verify temperature sensors; inspect condenser coils.'
  },
  {
    type: 'vb',
    code: 'VB03',
    title: 'Traction Control System Error',
    loco: 'Vande Bharat',
    symptom: 'Loss of traction, system error display',
    fix: 'Reset traction control system; check wheel speed sensors; verify motor controller connections; inspect power electronics; check for software errors; verify regenerative braking system.'
  },
  {
    type: 'electric',
    code: '401',
    title: 'Brake System Fault',
    loco: 'WAG-9',
    symptom: 'Low brake pressure, brake not releasing',
    fix: 'Check brake pipe for leaks; verify brake cylinder operation; inspect brake valve; check air dryer operation; verify brake rigging; inspect brake shoes; check emergency brake system.'
  },
  {
    type: 'electric',
    code: '501',
    title: 'Vigilance Control Malfunction',
    loco: 'WAP-7',
    symptom: 'Vigilance alarm not working, auto-brake activation',
    fix: 'Check vigilance control unit; verify foot pedal operation; inspect reset button; check wiring connections; test alarm buzzer; verify timer settings; replace faulty control module if needed.'
  }
];
