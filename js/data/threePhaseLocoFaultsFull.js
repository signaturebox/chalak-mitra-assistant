// 3-Phase Electric Locomotive Fault Database - Full Version (SS01-SS19)
// Extracted from MASTER_TSD_SS01_SS19.json
// Source: MASTER_TSD_SS01_SS19.json

// Transform master JSON data to match current implementation structure
const THREE_PHASE_LOCO_FAULTS_FULL = {
  // SS01: MAIN POWER
  SS01: {
    subsystem: 'Main Power',
    faults: [
      {
        code: 'F0101P1',
        message: 'VCB STUCK IN ON POSITION',
        description: 'Loco will be shut down',
        indicators: {
          LSDJ: 'ON',
          BPFA: 'ON',
          LSFI: 'BLINKING'
        },
        effects: ['SR Contactor opens and pantograph lowers'],
        troubleshooting: [
          'Bring throttle to 0',
          'Press BPFA and acknowledge fault',
          'Clear block section while coasting',
          'Stop the loco',
          'Switch OFF and ON Control Electronics',
          'Raise pantograph, close VCB and take traction',
          'If not successful, try from other cab'
        ]
      },
      {
        code: 'F0102P1',
        message: 'VCB STUCK IN OFF POSITION',
        description: 'Try to close VCB again',
        indicators: {
          LSDJ: 'ON',
          BPFA: 'ON',
          LSFI: 'BLINKING'
        },
        effects: ['VCB control changes to redundant processor'],
        troubleshooting: [
          'Bring throttle to 0',
          'Press BPFA to ACK',
          'Ensure VCB COC is open',
          'Press BLDJ to close VCB',
          'If VCB closes take traction',
          'If possible clear block section while coasting',
          'Switch OFF and ON control electronics',
          'Raise pantograph, close VCB and take traction',
          'If not successful, try from other cab'
        ]
      },
      {
        code: 'F0103P1',
        message: 'LOW PRESSURE PANTO / FAULTY PANTO',
        description: 'Check isolating cock and auxiliary reservoir pressure',
        indicators: {
          LSDJ: 'ON',
          BPFA: 'ON',
          LSFI: 'BLINKING'
        },
        effects: ['Pantograph will not raise and VCB will not close'],
        troubleshooting: [
          'Bring throttle to 0 and BPFA ACK',
          'Check whether MCPA is running',
          'Check MCPA MCB and reset if tripped',
          'Check auxiliary reservoir pressure is sufficient',
          'Change pantograph selector switch and try other pantograph',
          'If still not successful, try cab change / control electronics OFF-ON'
        ]
      },
      {
        code: 'F0104P1',
        message: 'CATENARY VOLTAGE OUT OF LIMIT',
        description: 'Close VCB when OHE voltage becomes normal',
        indicators: {
          LSDJ: 'ON',
          BPFA: 'ON',
          LSFI: 'BLINKING'
        },
        effects: ['If OHE voltage out of limit, VCB will not close / will trip'],
        troubleshooting: [
          'Bring throttle to 0 and ACK with BPFA',
          'Observe U-meter (catenary voltmeter)',
          'Check pantograph contact with OHE',
          'Try pantograph change',
          'Close VCB when voltage normal',
          'If fault repeats, inform TLC/TPC'
        ]
      },
      {
        code: 'F0105P1',
        message: 'TRANSFORMER OIL TEMP / PRESSURE FAULT',
        description: 'Check oil pump/blower',
        indicators: {
          LSFI: 'BLINKING',
          BPFA: 'ON'
        },
        effects: ['Traction may reduce or VCB may trip'],
        troubleshooting: [
          'If TE available, clear block section while coasting',
          'Bring throttle to 0, ACK with BPFA',
          'Check transformer oil pump running',
          'Reset related HB panel MCB (after opening VCB)',
          'Check oil level gauge is between MIN and MAX',
          'Check oil cooling blower is running',
          'Retry traction'
        ]
      },
      {
        code: 'F0106P1',
        message: 'FILTER ON/OFF CONTACTOR STUCK ON',
        description: 'VCB will not close again',
        indicators: {
          LSDJ: 'ON',
          BPFA: 'ON',
          LSFI: 'BLINKING'
        },
        effects: ['Harmonic filter may auto isolate and speed may be limited'],
        troubleshooting: [
          'Bring throttle to 0 and ACK with BPFA',
          'Switch OFF/ON Control Electronics',
          'Raise pantograph and close VCB',
          'If loco becomes normal take traction',
          'Inform TLC and make logbook entry'
        ]
      },
      {
        code: 'F0107P1',
        message: 'PRECHARGE / MAIN CONTACTOR STUCK ON',
        description: 'Main converter blocked',
        indicators: {
          LSDJ: 'ON',
          BPFA: 'ON',
          LSFI: 'BLINKING'
        },
        effects: ['VCB may trip and traction will be blocked'],
        troubleshooting: [
          'Bring throttle to 0',
          'Clear block section while coasting',
          'ACK with BPFA',
          'Switch OFF/ON Control Electronics',
          'Raise pantograph, close VCB and take traction',
          'If fault repeats isolate converter as per DDS'
        ]
      },
      {
        code: 'F0108P1',
        message: 'PRIMARY OVER CURRENT',
        description: 'Reset relay flag and close VCB',
        indicators: {
          LSDJ: 'ON',
          BPFA: 'ON',
          LSFI: 'BLINKING'
        },
        effects: ['Power supply cut, VCB may trip'],
        troubleshooting: [
          'Check for smoke/fire in machine room',
          'Clear block section while coasting',
          'ACK with BPFA',
          'Check OCR relay flag on SB-1',
          'Reset relay and close VCB',
          'Inform TLC'
        ]
      },
      {
        code: 'F0109P1',
        message: 'AUX. WINDING OVER CURRENT',
        description: 'Close VCB again',
        indicators: {
          LSDJ: 'ON',
          BPFA: 'ON',
          LSFI: 'BLINKING'
        },
        effects: ['VCB trips'],
        troubleshooting: [
          'ACK with BPFA',
          'Close VCB using BLDJ',
          'Clear block section while coasting',
          'If isolation message comes press ENTER to ACK'
        ]
      },
      {
        code: 'F0110P1',
        message: 'FATAL ERROR IN MAIN CIRCUIT',
        description: 'Turn OFF the loco',
        indicators: {
          LSDJ: 'ON',
          BPFA: 'ON',
          LSFI: 'BLINKING'
        },
        effects: ['VCB trips and pantograph lowers'],
        troubleshooting: [
          'Bring throttle to 0',
          'ACK with BPFA',
          'Check all HB/SB panel MCBs',
          'Switch OFF/ON Control Electronics',
          'Raise pantograph, close VCB and take traction'
        ]
      },
      {
        code: 'F0101P2',
        message: 'OVER TEMPERATURE CONTROL ELECTRONICS',
        description: 'Run cooling mode',
        indicators: {
          LSCE: 'ON',
          BPFA: 'ON'
        },
        effects: ['Control electronics contactor will not close'],
        troubleshooting: [
          'ACK with BPFA',
          'Inform to stop train for 10-15 minutes',
          'Keep BL key in \'C\' position',
          'Raise pantograph and close VCB',
          'After cooling open VCB and lower pantograph',
          'Keep BL key to \'D\' and resume normal run'
        ]
      },
      {
        code: 'F0102P2',
        message: 'TRANSFORMER OIL PRESSURE NOT OK',
        description: 'Check oil pump circuit',
        indicators: {
          BPFA: 'ON'
        },
        effects: ['VCB may trip / TE may reduce'],
        troubleshooting: [
          'ACK with BPFA',
          'Check oil pump running',
          'Reset HB panel MCB (after opening VCB)',
          'Close VCB and run'
        ]
      },
      {
        code: 'F0103P2',
        message: 'EARTH FAULT AUX. WINDING CIRCUIT',
        description: 'Continue normal operation, check in maintenance',
        indicators: {
          BPFA: 'ON'
        },
        effects: ['May lead to converter isolation if repeated'],
        troubleshooting: [
          'ACK with BPFA',
          'Check smoke/fire in machine room',
          'Inform TLC and make logbook entry'
        ]
      },
      {
        code: 'F0104P2',
        message: 'LOW FREQUENCY CATENARY VOLTAGE',
        description: 'Retry after 1 minute',
        indicators: {
          BPFA: 'ON'
        },
        effects: ['Traction temporarily blocked'],
        troubleshooting: [
          'ACK with BPFA',
          'Retry traction after 1 minute'
        ]
      },
      {
        code: 'F0105P2',
        message: 'CATENARY FREQUENCY IS HIGH',
        description: 'Keep throttle 0 and wait',
        indicators: {
          BPFA: 'ON'
        },
        effects: ['Traction blocked until it drops below 55Hz'],
        troubleshooting: [
          'ACK with BPFA',
          'Proceed when frequency becomes normal'
        ]
      },
      {
        code: 'F0106P2',
        message: 'MACHINE ROOM BLOWER NOT OFF',
        description: 'Continue normal operation',
        indicators: {
          BPFA: 'ON'
        },
        effects: ['Blower may run continuously'],
        troubleshooting: [
          'ACK with BPFA',
          'Inform TLC'
        ]
      },
      {
        code: 'F0107P2',
        message: 'DEMANDED SPEED CAN NOT BE ACHIEVED',
        description: 'Speed limit / jerk issue',
        indicators: {
          BPFA: 'ON'
        },
        effects: ['Speed not beyond 1 kmph / jerks above 50% TE'],
        troubleshooting: [
          'ACK with BPFA',
          'As per DDS message isolate TC / bypass speed sensor',
          'Inform TLC'
        ]
      }
    ]
  },
  // SS02: TRACTION BOGIE 1
  SS02: {
    subsystem: 'Traction Bogie 1',
    faults: [
      {
        code: 'F0201P1',
        message: 'DISTURBANCE IN CONVERTER 1',
        description: 'Try to close VCB again',
        indicators: {
          LSDJ: 'ON',
          BPFA: 'ON',
          LSFI: 'BLINKING'
        },
        effects: ['VCB will open / Bogie-1 traction will be affected'],
        troubleshooting: [
          'Bring throttle to \'0\' position and press BPFA to acknowledge fault',
          'Check MCB 127.1/1 (if tripped reset with MCE OFF)',
          'Press BLDJ to close VCB',
          'If message repeats, switch MCE OFF then ON after 5 minutes, raise panto and close VCB',
          'If bogie-1 does not isolate automatically, isolate bogie-1 by switch no.154 on SB1 panel',
          'Inform TLC and note DDS message in logbook'
        ]
      },
      {
        code: 'F0202P1',
        message: 'CONVERTER CONTACTOR STUCK OFF',
        description: 'Try to close VCB again',
        indicators: {
          LSDJ: 'ON',
          BPFA: 'ON',
          LSFI: 'BLINKING'
        },
        effects: ['Converter contactor will not close / Bogie-1 traction affected'],
        troubleshooting: [
          'Bring throttle to 0 and ACK using BPFA',
          'Check MCBs on SB-1 (especially MCB 127.11/1)',
          'Press BLDJ to close VCB',
          'If SR-1 air leakage exists, rectify',
          'If problem persists, isolate bogie-1'
        ]
      },
      {
        code: 'F0203P1',
        message: 'GATE UNIT SUPPLY STUCK OFF',
        description: 'Try to close VCB',
        indicators: {
          LSDJ: 'ON',
          BPFA: 'ON',
          LSFI: 'BLINKING'
        },
        effects: ['VCB open / bogie-1 may isolate'],
        troubleshooting: [
          'Bring throttle to 0 and ACK with BPFA',
          'Check MCB 127.11/1 on SB-1, reset with MCE OFF if tripped',
          'Press BLDJ to close VCB',
          'If message repeats, isolate bogie-1 and proceed, inform TLC'
        ]
      },
      {
        code: 'F0205P1',
        message: 'CONVERTER-1 TEMPERATURE TOO HIGH',
        description: 'Try to close VCB again',
        indicators: {
          LSDJ: 'ON',
          BPFA: 'ON',
          LSFI: 'BLINKING'
        },
        effects: ['Converter-1 trip/block, bogie-1 may isolate'],
        troubleshooting: [
          'Bring throttle to 0 and ACK with BPFA',
          'If HB-1 MCB 59.1/1 & 63.1/1 tripped, open VCB, reset and close VCB',
          'Check converter pump unit-1 (OCB-1) operation',
          'If SR-1 leakage/abnormality, rectify',
          'If still persists, isolate bogie-1 (switch 154 SB-1)'
        ]
      },
      {
        code: 'F0206P1',
        message: 'CONVERTER-1 OIL PRESSURE LOW / CHECK OIL LEVEL',
        description: 'Try to close VCB again',
        indicators: {
          LSDJ: 'ON',
          BPFA: 'ON',
          LSFI: 'BLINKING'
        },
        effects: ['Low oil pressure may lead to bogie-1 isolation'],
        troubleshooting: [
          'Bring throttle to 0 and ACK with BPFA',
          'Check oil level in converter cubical; if below max level isolate bogie-1 using switch 154 position \'1\'',
          'If oil level OK, check MCB 63.1/1 in HB-1; reset after opening VCB if tripped',
          'If fault repeats after reset do not reset repeatedly, isolate bogie-1',
          'Also check additional MCB of SR coolant pump (BHEL IGBT) and SR ventilation MCB (BTIL)'
        ]
      },
      {
        code: 'F0207P1',
        message: 'TRACTION MOTOR TEMPERATURE TOO HIGH',
        description: 'Converter-1 may block, bogie-1 may isolate',
        indicators: {
          LSFI: 'BLINKING',
          BPFA: 'ON'
        },
        effects: ['TE/BE will reduce'],
        troubleshooting: [
          'ACK with BPFA',
          'Check MCB 63.1/1 in HB-1 (reset if tripped)',
          'Check BUR-1 operation and try open/close VCB',
          'If problem persists keep bogie-1 isolated',
          'Inform TLC'
        ]
      },
      {
        code: 'F0201P2',
        message: 'EARTH FAULT IN CONVERTER 1',
        description: 'Normal operation can continue',
        indicators: {
          BPFA: 'ON'
        },
        effects: ['To be checked during maintenance'],
        troubleshooting: [
          'Check smoke/smell in SR-1',
          'ACK with BPFA',
          'Continue normal operation'
        ]
      },
      {
        code: 'F0202P2',
        message: 'TRACTION MOTOR OVERSPEED',
        description: 'TE is being reduced',
        indicators: {
          BPFA: 'ON'
        },
        effects: ['TE reduces; isolate bogie-1 using switch 154 if needed'],
        troubleshooting: [
          'ACK with BPFA',
          'Continue normal operation'
        ]
      },
      {
        code: 'F0203P2',
        message: 'MUB RESISTANCE TOO HOT IN CONVERTER 1',
        description: 'Wait for 30 seconds',
        indicators: {
          LSDJ: 'ON',
          BPFA: 'ON',
          LSFI: 'BLINKING'
        },
        effects: [],
        troubleshooting: [
          'Wait for 30 seconds before closing VCB to allow MUB resistance to cool down (15.1 in converter cubicle). Acknowledge BPFA fault by pressing ACK',
          'Press BLDJ to close VCB'
        ]
      },
      {
        code: 'F0204P2',
        message: 'FAULTY MOTOR TEMPERATURE SENSOR',
        description: 'Normal operation can continue. To be checked during maintenance',
        indicators: {
          BPFA: 'ON'
        },
        effects: [],
        troubleshooting: [
          'ACK with BPFA. Continue normal operation',
          'Inform TLC and record in log book'
        ]
      },
      {
        code: 'F0205P2',
        message: 'EQUIPMENT TEMPERATURE HIGH',
        description: 'TE/BE is being reduced',
        indicators: {
          BPFA: 'ON'
        },
        effects: ['TE/BE will keep reducing continuously'],
        troubleshooting: [
          'Clear blank section and bring throttle to "0" position. Acknowledge BPFA fault by pressing ACK',
          'Wait for 10 minutes or some time for transformer/converter oil temperature to become normal',
          'Check all MCBs on HB/SB panel, if tripped reset once',
          'Ensure all auxiliary and MRB operation',
          'Continue normal operation',
          'If fault does not go away, turn OFF control electronics and then ON. Raise panto, close VCB. If loco becomes normal start traction. Otherwise isolate bogie-1 by bogie cut out switch 154 and inform TLC, run train with one bogie',
          'If not successful in 20 minutes, ask for assistance engine'
        ]
      },
      {
        code: 'F0206P2',
        message: 'DC LINK CAPACITORS PRESSURE NOT OK',
        description: 'Normal operation can continue. To be checked during maintenance',
        indicators: {
          BPFA: 'ON'
        },
        effects: [],
        troubleshooting: [
          'Acknowledge BPFA fault and continue normal operation',
          'Inform TLC and record in log book. Inform maintenance staff at destination station',
          'During maintenance, DC Link capacitors should be checked. Capacitor open circuit or damaged may be found'
        ]
      },
      {
        code: 'F0207P2',
        message: 'WHEEL SKIDDING IN BOGIE 1',
        description: 'Reduce BE',
        indicators: {
          BPFA: 'ON'
        },
        effects: [],
        troubleshooting: [
          'Acknowledge BPFA fault. Ensure free movement of wheels (Check Free movement)',
          'Ensure that loco does not have brake binding',
          'Check that all parking brakes are properly released',
          'If speed is more than 1 kmph per hour and DDS has "Error Tacho Generator" message, loco pilot can work normally',
          'Reduce braking effort, experience wheel skidding sound in running train. Inform TLC and record in log book',
          'Do not use BPCS and regenerative brake'
        ]
      },
      {
        code: 'F0208P2',
        message: 'DOPPLER RADAR FAILED',
        description: '',
        indicators: {
          BPFA: 'ON'
        },
        effects: [],
        troubleshooting: [
          'Acknowledge BPFA fault',
          'If background DDS message SLG1:0083/SLG2:0083 Radar control disabled/Faulty comes',
          'Work normally'
        ]
      }
    ]
  },
  // SS03: TRACTION BOGIE 2
  SS03: {
    subsystem: 'Traction Bogie 2',
    faults: [
      {
        code: 'F0301P1',
        message: 'DISTURBANCE IN CONVERTER 2',
        description: 'Try to close VCB again',
        indicators: {
          LSDJ: 'ON',
          BPFA: 'ON',
          LSFI: 'BLINKING'
        },
        effects: ['VCB will open'],
        troubleshooting: [
          'Bring throttle to "0" position. Acknowledge BPFA fault by pressing ACK',
          'Check MCB 127.1/2 (SB2). If tripped, turn OFF control electronics and reset once',
          'Press BLDJ to close VCB',
          'If same message comes again, turn OFF control electronics after 5 minutes and ON. Raise panto and close VCB and if loco becomes normal start traction',
          'If same message comes again and traction bogie-2 does not isolate on its own, isolate bogie-2 by MCB 127.1/2 and 127.11/2 (SB-2) (MCE OFF)',
          'Inform TLC and record bogie isolated message in log book before it comes in DDS'
        ]
      },
      {
        code: 'F0302P1',
        message: 'CONVERTER CONTACTOR STUCK OFF',
        description: 'Try to close VCB again',
        indicators: {
          LSDJ: 'ON',
          BPFA: 'ON',
          LSFI: 'BLINKING'
        },
        effects: ['VCB will open'],
        troubleshooting: [
          'Bring throttle to "0" position. Acknowledge BPFA fault by pressing ACK',
          'In CCB-2 loco - Check MR and FP pressure gauge. If pressure is low, keep MPJ to "0" position and repair it',
          'Press BLDJ to close VCB',
          'Check air leakage in SR-2 {traction converter-2}. If air leakage is there, isolate related SR by cock (88) on pneumatic panel. Isolate COC 88 right and inside (second from above) on pneumatic panel and then isolate bogie-2 by switch 154 (SB-1)',
          'Press BLDJ to close VCB. If VCB does not close and same message comes, isolate bogie-2'
        ]
      },
      {
        code: 'F0303P1',
        message: 'GATE UNIT SUPPLY STUCK OFF',
        description: 'Try to close VCB again',
        indicators: {
          LSDJ: 'ON',
          BPFA: 'ON',
          LSFI: 'BLINKING'
        },
        effects: ['VCB will open'],
        troubleshooting: [
          'Bring throttle to "0" position. Acknowledge BPFA fault by pressing ACK',
          'Check MCB 127.11/2 on SB-2. If tripped, turn OFF control electronics and reset once',
          'Press BLDJ to close VCB'
        ]
      },
      {
        code: 'F0305P1',
        message: 'CONVERTER-2 OIL TEMPERATURE TOO HIGH',
        description: 'Try to close VCB again',
        indicators: {
          LSDJ: 'ON',
          BPFA: 'ON',
          LSFI: 'BLINKING'
        },
        effects: ['VCB will open'],
        troubleshooting: [
          'Bring throttle to "0" position. Acknowledge BPFA fault by pressing ACK',
          'Check oil level in converter expansion tank on converter cubicle',
          'Check MCB 59.1/2 and 63.1/2 on HB-2 panel. If tripped, open VCB and reset once and ensure traction converter pump-2 operation. Ensure OCB-2 operation from radiator in underframe by air coming through it',
          'Check loco pilot OCB-2 impeller and casing for any damage. If damaged, open VCB and raise panto. Trip MCB 59.1/2, MCB 62.1/2 and MCB 63.1/2 on HB-2, then isolate bogie-2 by switch 154 (on SB-1)',
          'Energize loco and run train with one bogie. In this situation LSFI will keep blinking continuously. Inform TLC and record in log book'
        ]
      },
      {
        code: 'F0306P1',
        message: 'CONVERTER 2 OIL PRESSURE NOT OK',
        description: 'Check oil level, Try to close the VCB again',
        indicators: {
          LSDJ: 'ON',
          BPFA: 'ON',
          LSFI: 'BLINKING'
        },
        effects: ['VCB will open'],
        troubleshooting: [
          'Bring throttle to "0" position. Acknowledge BPFA fault by pressing ACK',
          'Check oil level in converter expansion tank on converter cubicle. If above maximum or below minimum, isolate bogie-2 by switch 154 to "II" and work with half traction',
          'If oil level is OK, check MCB 63.1/2 on HB-2 panel. If tripped, open VCB and reset once. Check if SR-2 oil pump in machine room is running or not by touching its inlet and outlet pipe',
          'If MCB 63.1/2 trips again after one reset, do not reset it. Bogie-2 will isolate on its own and LSFI will keep blinking. Work with half traction',
          'Check loco pilot traction converter-2 oil pump line for oil leakage and any damage and check oil cooling blower-2 casing impeller for any damage. In such situation radiator damage can cause oil leakage and "Converter No.2 oil pressure low" message may come. Loco pilot open VCB, raise panto and trip MCB 59.1/2 and MCB 63.1/2 on HB-2 panel. Isolate bogie-2 by switch 154 to "II". Energize loco and work with one bogie. In above situation no. 2 and 5, LSFI will keep blinking continuously. Inform TLC and record in log book',
          'If SR-2 oil pump is normal, turn OFF control electronics and isolate BUR-2 by MCB 127.22/2',
          'If successful, run train with BUR-2 isolated',
          'If not successful, isolate bogie-2 by switch 154 to "II". Inform TLC'
        ]
      },
      {
        code: 'F0307P1',
        message: 'TRACTION MOTOR TEMPERATURE TOO HIGH',
        description: 'Converter 2 blocked, Bogie 2 may get isolated',
        indicators: {
          LSFI: 'BLINKING',
          BPFA: 'ON'
        },
        effects: [],
        troubleshooting: [
          'Clear blank section and bring throttle to "0" position. Acknowledge BPFA fault by pressing ACK',
          'Check if traction motor blower-2 is working or not, manually check air suction through TM Louver. Check MCB 53.1/2 on HB-2 panel. If tripped, open VCB and reset once'
        ]
      }
    ]
  },
  // SS04: HARMONIC FILTER
  SS04: {
    subsystem: 'Harmonic Filter',
    faults: [
      {
        code: 'F0401P1',
        message: 'HARMONIC FILTER CURRENT TOO HIGH',
        description: 'Try to close VCB again',
        indicators: {
          LSDJ: 'ON',
          BPFA: 'ON',
          LSFI: 'BLINKING'
        },
        effects: ['VCB will open'],
        troubleshooting: [
          'Bring throttle to "0" position. Acknowledge BPFA fault by pressing ACK',
          'Press BLDJ to close VCB',
          'If fault persists, turn OFF control electronics once and then ON. Raise panto, close VCB and start traction'
        ]
      },
      {
        code: 'F0402P1',
        message: 'HARM. FILTER CONTACTOR(S) STUCK OFF/ON',
        description: 'Harmonic filter will be isolated, Speak to TLC',
        indicators: {
          LSDJ: 'ON',
          BPFA: 'ON',
          LSFI: 'BLINKING'
        },
        effects: [],
        troubleshooting: [
          'Bring throttle to "0" position. Acknowledge BPFA fault by pressing ACK',
          'Press BLDJ to close VCB',
          'If fault persists, turn OFF control electronics once and then ON. Raise panto, close VCB and start traction'
        ]
      },
      {
        code: 'F0404P1',
        message: 'RESISTOR TOO HOT',
        description: 'No. of filter discharges exceeded, VCB will remain inhibited 15 min',
        indicators: {
          LSDJ: 'ON',
          BPFA: 'ON',
          LSFI: 'BLINKING'
        },
        effects: ['Harmonic filter isolated', 'Maximum speed 40 KMPH'],
        troubleshooting: [
          'Bring throttle to "0" position. Acknowledge BPFA fault by pressing ACK',
          'Wait for 15 minutes and try to close VCB again by pressing BLDJ',
          'If fault persists, turn OFF control electronics and then ON. Raise panto, close VCB and start traction',
          'Inform TLC and record in log book'
        ]
      },
      {
        code: 'F0401P2',
        message: 'FILTER CONTACTOR 8.1 STUCK ON',
        description: 'If VCB opens it will not close again',
        indicators: {
          BPFA: 'ON'
        },
        effects: [],
        troubleshooting: [
          'If VCB opens, pressing BLDJ will not close VCB. Acknowledge BPFA fault by pressing ACK',
          'Clear section without opening VCB and shut down the train',
          'Turn OFF control electronics and then ON. Raise panto, close VCB and start traction',
          'If VCB does not close, ask for assistance engine within 20 minutes'
        ]
      },
      {
        code: 'F0402P2',
        message: 'EARTH FAULT HARMONIC FILTER CIRCUIT',
        description: 'Normal operation can continue. To be checked during maintenance',
        indicators: {
          BPFA: 'ON'
        },
        effects: [],
        troubleshooting: [
          'Acknowledge BPFA fault. Continue normal operation',
          'Inform TLC and record in log book'
        ]
      }
    ]
  },
  // SS05: HOTEL LOAD
  SS05: {
    subsystem: 'Hotel Load',
    faults: [
      {
        code: 'F0501P1',
        message: 'FAULT IN HOTEL LOAD CONVERTER',
        description: 'VCB will open',
        indicators: {
          LSDJ: 'ON',
          BPFA: 'ON',
          LSFI: 'BLINKING'
        },
        effects: ['VCB will open', 'Hotel load not available'],
        troubleshooting: [
          'Bring throttle to "0" position. Acknowledge BPFA fault by pressing ACK',
          'Press BLDJ to close VCB',
          'If fault still persists, hotel load converter will isolate automatically',
          'Continue normal traction operation',
          'Inform TLC about hotel load failure if needed for passenger comfort'
        ]
      },
      {
        code: 'F0502P1',
        message: 'CONTACTOR FAULT IN HOTEL LOAD',
        description: 'Contactor stuck OFF or ON',
        indicators: {
          LSDJ: 'ON',
          BPFA: 'ON',
          LSFI: 'BLINKING'
        },
        effects: ['Hotel load may not be available'],
        troubleshooting: [
          'Bring throttle to "0" position. Acknowledge BPFA fault by pressing ACK',
          'Press BLDJ to close VCB',
          'If fault persists, hotel load will isolate',
          'Continue traction normally'
        ]
      }
    ]
  },
  // SS06: AUX-CONVERTER 1
  SS06: {
    subsystem: 'Auxiliary Converter 1',
    faults: [
      {
        code: 'F0601P1',
        message: 'DISTURBANCE IN PROCESSOR BUR 1',
        description: 'Try to close VCB again',
        indicators: {
          LSDJ: 'ON',
          BPFA: 'ON',
          LSFI: 'BLINKING'
        },
        effects: ['VCB will open'],
        troubleshooting: [
          'Bring throttle to "0" position. Acknowledge BPFA fault by pressing ACK',
          'BUR-1 will isolate on its own. Press ENTER key',
          'Press BLDJ to close VCB',
          'Continue normal traction'
        ]
      },
      {
        code: 'F0602P1',
        message: 'FAULT IN AUXILIARY CONVERTER 1',
        description: 'Try to close VCB again',
        indicators: {
          LSDJ: 'ON',
          BPFA: 'ON',
          LSFI: 'BLINKING'
        },
        effects: ['VCB will open'],
        troubleshooting: [
          'Bring throttle to "0" position. Acknowledge BPFA fault by pressing ACK',
          'Press BLDJ to close VCB',
          'If message comes again, BUR-1 will isolate on its own. Press <ENTER> key',
          'Check MCB no. 54.1/1 on HB-1. If tripped, open VCB and reset. If MCB no. 54.1/1 trips again and auxiliary converter-1 gets isolated, run the train. Inform TLC {In IGBT BUR-1, MRB-1 also gets isolated on converter fault due to not working}',
          'Continue normal traction'
        ]
      },
      {
        code: 'F0603P1',
        message: 'CONTACTOR FAULT IN AUX. CONV-1/HB1',
        description: 'Contactor 52/4 or 52/5 stuck OFF or ON',
        indicators: {
          LSDJ: 'ON',
          BPFA: 'ON',
          LSFI: 'BLINKING'
        },
        effects: [],
        troubleshooting: [
          'Bring throttle to "0" position. Acknowledge BPFA fault by pressing ACK',
          'Press BLDJ to close VCB',
          'If fault still persists, BUR-1 will isolate. Loco pilot can work normally till next determined station'
        ]
      },
      {
        code: 'F0604P1',
        message: 'VENTILATION BUR 1 DISTURBED',
        description: 'Press acknowledge to reconfigure to BUR 2',
        indicators: {
          LSFI: 'BLINKING',
          BPFA: 'ON'
        },
        effects: ['Auxiliary converter-1 isolated', 'Driving available but max. ventilation level will be reduced'],
        troubleshooting: [
          'Bring throttle to "0" position. Acknowledge BPFA fault by pressing ACK',
          'Turn OFF control electronics once and then ON. Raise panto, close VCB, if loco becomes normal start traction',
          'If same message comes again, keep BUR-1 isolated and continue normal operation',
          'Inform TLC and record in log book'
        ]
      }
    ]
  },
  // SS07: AUX-CONVERTER 2
  SS07: {
    subsystem: 'Auxiliary Converter 2',
    faults: [
      {
        code: 'F0701P1',
        message: 'DISTURBANCE IN PROCESSOR BUR 2',
        description: 'Try to close VCB again',
        indicators: {
          LSDJ: 'ON',
          BPFA: 'ON',
          LSFI: 'BLINKING'
        },
        effects: ['VCB will open'],
        troubleshooting: [
          'Bring throttle to "0" position. Acknowledge BPFA fault by pressing ACK',
          'BUR-2 will isolate on its own. Press ENTER key',
          'Press BLDJ to close VCB',
          'Continue normal traction'
        ]
      },
      {
        code: 'F0702P1',
        message: 'FAULT IN AUXILIARY CONVERTER 2',
        description: 'Try to close VCB again',
        indicators: {
          LSDJ: 'ON',
          BPFA: 'ON',
          LSFI: 'BLINKING'
        },
        effects: ['VCB will open'],
        troubleshooting: [
          'Bring throttle to "0" position. Acknowledge BPFA fault by pressing ACK',
          'Press BLDJ to close VCB',
          'If message comes again, BUR-2 will isolate on its own. Press <ENTER> key',
          'Check MCB no. 54.1/2 on HB-2. If tripped, open VCB and reset. Continue normal traction. If MCB no. 54.1/2 trips again, clear section and inform TLC and ask for help {In IGBT BUR-2 & 3, MRB-2 also gets isolated on converter fault due to not working. This will cause F0110P1 fault to come for which table shoot}',
          'Continue normal traction'
        ]
      },
      {
        code: 'F0703P1',
        message: 'CONTACTOR FAULT IN AUX CONV-2/HB2',
        description: 'Contactor 52/1/2/4 stuck OFF or ON',
        indicators: {
          LSDJ: 'ON',
          BPFA: 'ON',
          LSFI: 'BLINKING'
        },
        effects: [],
        troubleshooting: [
          'Bring throttle to "0" position. Acknowledge BPFA fault by pressing ACK',
          'Press BLDJ to close VCB',
          'If fault still persists, BUR-2 will isolate. Loco pilot can work normally till next determined station'
        ]
      },
      {
        code: 'F0704P1',
        message: 'VENTILATION BUR 2 DISTURBED',
        description: 'Press acknowledge to reconfigure to BUR 1',
        indicators: {
          LSFI: 'BLINKING',
          BPFA: 'ON'
        },
        effects: ['Auxiliary converter-2 isolated', 'Driving available but max. ventilation level will be reduced'],
        troubleshooting: [
          'Bring throttle to "0" position. Acknowledge BPFA fault by pressing ACK',
          'Turn OFF control electronics once and then ON. Raise panto, close VCB, if loco becomes normal start traction',
          'If same message comes again, keep BUR-2 isolated and continue normal operation',
          'Inform TLC and record in log book'
        ]
      }
    ]
  },
  // SS08: AUX-CONVERTER 3
  SS08: {
    subsystem: 'Auxiliary Converter 3',
    faults: [
      {
        code: 'F0801P1',
        message: 'DISTURBANCE IN PROCESSOR BUR 3',
        description: 'Try to close VCB again',
        indicators: {
          LSDJ: 'ON',
          BPFA: 'ON',
          LSFI: 'BLINKING'
        },
        effects: ['VCB will open'],
        troubleshooting: [
          'Bring throttle to "0" position. Acknowledge BPFA fault by pressing ACK',
          'BUR-3 will isolate on its own. Press ENTER key',
          'Press BLDJ to close VCB',
          'Continue normal traction'
        ]
      },
      {
        code: 'F0802P1',
        message: 'FAULT IN AUXILIARY CONVERTER 3',
        description: 'Try to close VCB again',
        indicators: {
          LSDJ: 'ON',
          BPFA: 'ON',
          LSFI: 'BLINKING'
        },
        effects: ['VCB will open'],
        troubleshooting: [
          'Bring throttle to "0" position. Acknowledge BPFA fault by pressing ACK',
          'Press BLDJ to close VCB',
          'If second message comes, BUR-3 will isolate on its own. Press <ENTER> key',
          'Check MCB no. 54.1/2 on HB-2. If tripped, open VCB and reset. Continue normal traction. If MCB no. 54.1/2 trips again, clear section and inform TLC and ask for help {In IGBT BUR-2 & 3, MRB-2 also gets isolated on converter fault due to not working. This will cause F0110P1 fault to come for which table shoot}'
        ]
      },
      {
        code: 'F0803P1',
        message: 'CONTACTOR FAULT IN AUX CONV 3',
        description: 'Contactor 52/3 stuck OFF or ON',
        indicators: {
          LSDJ: 'ON',
          BPFA: 'ON',
          LSFI: 'BLINKING'
        },
        effects: [],
        troubleshooting: [
          'Bring throttle to "0" position. Acknowledge BPFA fault by pressing ACK',
          'Press BLDJ to close VCB',
          'If fault still persists, BUR-3 will isolate. Loco pilot can work normally till next determined station'
        ]
      }
    ]
  },
  // SS09: BATTERY SYSTEM
  SS09: {
    subsystem: 'Battery System',
    faults: []
  },
  // SS10: (Not in master JSON)
  SS10: {
    subsystem: 'Not Available',
    faults: []
  },
  // SS11: AUXILIARIES HB-1
  SS11: {
    subsystem: 'Auxiliaries HB 1',
    faults: []
  },
  // SS12: AUXILIARIES HB-2
  SS12: {
    subsystem: 'Auxiliaries HB 2',
    faults: []
  },
  // SS13: CAB 1
  SS13: {
    subsystem: 'Cab 1',
    faults: []
  },
  // SS14: CAB 2
  SS14: {
    subsystem: 'Cab 2',
    faults: []
  },
  // SS15: FIRE DETECTION UNIT
  SS15: {
    subsystem: 'Fire Detection Unit',
    faults: []
  },
  // SS16: SPEEDOMETER
  SS16: {
    subsystem: 'Speedometer',
    faults: []
  },
  // SS17: FLG1 / ICP1
  SS17: {
    subsystem: 'FLG1 / ICP1',
    faults: []
  },
  // SS18: FLG2 / ICP2
  SS18: {
    subsystem: 'FLG2 / ICP2',
    faults: []
  },
  // SS19: TRAIN BUS
  SS19: {
    subsystem: 'Train Bus',
    faults: []
  }
};

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = THREE_PHASE_LOCO_FAULTS_FULL;
}