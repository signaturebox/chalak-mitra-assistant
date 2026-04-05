// 3-Phase Electric Locomotive Fault Database
// Extracted from TSD (Trouble Shooting Directory) PDF
// Source: 3 PHASE LOCO TSD.pdf

const THREE_PHASE_LOCO_FAULTS = {
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
        effects: ['Loco will be shut down', 'VCB cannot trip'],
        troubleshooting: [
          'Bring throttle to "0" position. Acknowledge BPFA fault by pressing ACK',
          'Clear blank section while coasting',
          'Shut down the loco',
          'Turn OFF control electronics and then turn ON (Control electronics OFF/ON procedure mentioned on page 74/75). If LSDJ is lit then:',
          'Raise the pantograph and close VCB and start traction',
          'If not successful, try from second cab'
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
        effects: ['VCB control changed to redundant processor'],
        troubleshooting: [
          'Bring throttle to "0" position. Acknowledge BPFA fault by pressing ACK',
          'Ensure VCB COC Key is open',
          'Press BLDJ to close VCB',
          'If VCB closes, start traction',
          'Otherwise, if possible, clear blank section while coasting and shut down the loco',
          'Turn OFF control electronics and then turn ON',
          'Raise the pantograph and close VCB. Start traction',
          'If not successful, try from second cab'
        ]
      },
      {
        code: 'F0103P1',
        message: 'LOW PRESSURE PANTO/FAULTY PANTO',
        description: 'Check Isolating Cock, Check Aux. Reservoir Pressure',
        indicators: {
          LSDJ: 'ON',
          BPFA: 'ON',
          LSFI: 'BLINKING'
        },
        effects: ['Pantograph not raising'],
        troubleshooting: [
          'Bring throttle to "0" position. Acknowledge BPFA fault by pressing ACK',
          'Ensure that pneumatic panel has IG-38 (blue key) in half position. KNORR-CCB-2 brake locos have IG-38 key in shut position',
          'Check if MCPA is running or not. If not running, check MCB 48.1(SB-2), if tripped reset it',
          'If MCPA still not running, tap "PANS-PS" on pneumatic panel from rear side by hand on E70 locos, and on CCB2 locos manually',
          'Check that auxiliary reservoir gauge has pressure more than 5.2 kg/cm². Ensure MCPA drain cock is closed on pneumatic panel (both should be equal)',
          'Check on pneumatic panel that panto and VCB isolating cock are open. Operate twice-thrice and ensure they are in horizontal position',
          'Try to raise pantograph. If not successful, try second pantograph by changing panto selector switch (85) position on pneumatic panel',
          'Panto circuit pressure is monitored by pressure switch 130.4/1 and 130.4/2. After giving panto raising command, if this pressure switch does not pick up in 35 seconds, VCB will not close. If VCB closes, it will open after 2 seconds. Pressure switch no. 130.4/1 and 130.4/2 i.e. 9/1 and 9/2, on pneumatic panel on E70 locos and tap "PAN1-PS and PAN2-PS" from rear side on CCB2 locos. Raise panto and close VCB',
          'If not successful, try changing cab/panto selector switch (85) position on pneumatic panel',
          'If still not successful, try turning OFF control electronics and then ON'
        ]
      },
      {
        code: 'F0104P1',
        message: 'CATENARY VOLTAGE OUT OF LIMIT',
        description: 'Watch Catenary Voltmeter, Close VCB When Voltage is OK',
        indicators: {
          LSDJ: 'ON',
          BPFA: 'ON',
          LSFI: 'BLINKING'
        },
        effects: ['VCB will not trip if catenary voltage is between 17.5 kv to 29 kv'],
        troubleshooting: [
          'Bring throttle to "0" position. Acknowledge BPFA fault by pressing ACK',
          'If U meter shows "0", ensure panto is touching OHE, check for damage on pantograph. If panto not touching OHE, raise second pantograph. If damage on pantograph, contact TPC/TLC. If no damage on pantograph, check for OHE tension: a) If no arcing, No tension related procedure, contact TPC/TLC and act as per order. b) If arcing is there, lower the pantograph and replace 2 Amp fuse on SB-1 panel with spare fuse. On successful operation work normally. c) If 2 Amp fuse does not blow, wait for OHE Voltage to come between 17.5 kv to 29 kv. When voltage is normal close VCB, start traction',
          'If U meter shows OHE Voltage between 17.5 kv to 29 kv, isolate traction converter 1 & 2 as per following messages: (i) If message SLG-1:0020 comes on DDS, isolate loco pilot traction converter 1 by MCB 127.1/1 and 127.11/1 {SB-1} (MCE OFF). (ii) If message SLG-2:0020 comes on DDS, isolate traction converter 2 by MCB 127.1/2 and 127.11/2 {SB-2} (MCE OFF)',
          'If not successful, turn OFF control electronics and then ON. Start traction',
          'If still not successful, try changing pantograph',
          'Try changing cab'
        ]
      },
      {
        code: 'F0105P1',
        message: 'TRANSFORMER OIL TEMPERATURE OR PRESSURE NOT OK',
        description: 'TE/BE reduction or VCB trips, Try to close VCB if open',
        indicators: {
          LSFI: 'BLINKING',
          BPFA: 'ON'
        },
        effects: ['TE/BE will be reduced - GTO pulse will stop, Hot shot will trip, VCB will open'],
        troubleshooting: [
          'If TE is available, clear blank section. Otherwise try to clear blank section while coasting',
          'Bring throttle to "0" position. Acknowledge BPFA fault by pressing ACK',
          'If VCB trips, acknowledge BPFA fault, close VCB, try to clear blank section while coasting',
          'Touch inlet and outlet pipe of transformer oil pump in underframe by hand and ensure transformer oil pump operation. Check MCB 62.1/1 on HB-1 panel and MCB 62.1/2 on HB-2. If tripped, open VCB and reset once {MCB reset procedure on page 101/102}. If transformer oil pump not running: a) Turn OFF control electronics and then ON. b) Keep the loco in idle position for 10 minutes',
          'Check oil level at oil gauge on transformer expansion tank in machine room. It should be between maximum and minimum',
          'Ensure oil cooling blower operation in loco pilot machine room if not running, check MCB 59.1/1 on HB-1 panel and MCB 59.1/2 on HB-2 panel. If tripped, open VCB and reset MCB once. If oil cooling blower not running: a) Turn OFF control electronics and then ON. b) Keep the loco in idle position for 10 minutes. If loco pilot oil cooling blower impeller and its casing is damaged: a) Isolate related oil cooling blower by tripping MCB 59.1/1 or 59.1/2. b) Trip related traction converter pump MCB 63.1/1 or 63.1/2. c) Trip related transformer oil pump MCB 62.1/1 or 62.1/2. Loco pilot should operate with above MCBs open and control electronics OFF and ON. Then loco pilot should isolate related bogie by SB-1 bogie isolating switch no. 154. Turn ON control electronics and raise panto and operate. Then keep one bogie in service with TLC advice and run the train',
          'Try to start traction'
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
        effects: ['Filter discharging contactor will open'],
        troubleshooting: [
          'If VCB opens, it will not close again',
          'Bring throttle to "0" position and acknowledge BPFA fault by pressing ACK. Turn OFF control electronics and then ON again. Raise pantograph, close VCB and if loco becomes normal start traction',
          'Harmonic filter will isolate on its own and loco pilot can work at 40 kmph speed'
        ]
      },
      {
        code: 'F0107P1',
        message: 'PRECHARGE OR MAIN CONTACTOR STUCK ON',
        description: 'Main converter blocked',
        indicators: {
          LSDJ: 'ON',
          BPFA: 'ON',
          LSFI: 'BLINKING'
        },
        effects: ['VCB will trip'],
        troubleshooting: [
          'Bring throttle to "0" position. Try to clear blank section while coasting',
          'Acknowledge BPFA fault by pressing ACK. Turn OFF control electronics and then ON again. Raise panto, close VCB and start traction',
          'If not successful, isolate related traction converter and clear section with one bogie in service as per following DDS messages: (i) If background message SLG-1:0037 or 0039 comes on DDS, isolate traction converter-1 by MCB 127.1/1 and 127.11/1 (SB-1). (ii) If background message SLG-2:0037 or 0039 comes on DDS, isolate traction converter-2 by MCB 127.1/2 and 127.11/2 (SB-2). Inform TLC and act as per order',
          'If not successful in 20 minutes, ask for assistance engine'
        ]
      },
      {
        code: 'F0108P1',
        message: 'PRIMARY OVER CURRENT',
        description: 'Check over current relay flag, Close VCB after unlocking relay',
        indicators: {
          LSDJ: 'ON',
          BPFA: 'ON',
          LSFI: 'BLINKING'
        },
        effects: ['VCB closing/holding power supply affected by Maximum current relay'],
        troubleshooting: [
          'Do not try to close VCB before checking the loco. Specially check OCR{78} and all oil points in machine room. If fire is visible, do F1501P1 message procedure and ask for help without delay',
          'If no fire, clear blank section while coasting and shut down the train. Acknowledge BPFA fault by pressing ACK',
          'Check OCR-78 relay target on SB-1 panel',
          'Check oil leakage in machine room',
          'Check oil level in both expansion tanks of transformer and both traction converters in machine room. It should be between Min. and Max. If any abnormality like oil leakage from machine room transformer, traction converter, excessive heat/sparking, shut down the loco. Ask for assistance engine within 20 minutes',
          'If OCR-78 (SB-1) target has dropped but there is no any kind of oil leakage like abnormality and oil in all four oil gauges is between Min. and Max., reset the relay by turning the knob clockwise, relay flag will rise',
          'Close VCB by BLDJ and record in log book by informing TLC',
          'If once again unsuccessful as above and VCB does not close, ask for assistance engine without delay'
        ]
      },
      {
        code: 'F0109P1',
        message: 'AUX. WINDING OVER CURRENT',
        description: 'Try to close VCB again',
        indicators: {
          LSDJ: 'ON',
          BPFA: 'ON',
          LSFI: 'BLINKING'
        },
        effects: ['VCB will trip'],
        troubleshooting: [
          'Acknowledge BPFA fault by pressing ACK. Press BLDJ to close VCB',
          'If fault persists, isolation message will come, acknowledge by pressing ENTER button',
          'Clear blank section while coasting and shut down the train'
        ]
      },
      {
        code: 'F0110P1',
        message: 'FATAL ERROR IN MAIN CIRCUIT',
        description: 'Turn OFF the Loco',
        indicators: {
          LSDJ: 'ON',
          BPFA: 'ON',
          LSFI: 'BLINKING'
        },
        effects: ['VCB will trip and panto will lower', 'More than one subsystem isolated'],
        troubleshooting: [
          'Bring throttle to "0" position and acknowledge BPFA fault by pressing ACK',
          'Check MCBs on HB/SB panel. If tripped, reset once',
          'Turn OFF control electronics and then ON again. Raise panto, close VCB and start traction',
          'Note: This will be applicable only after implementation of RDSO modification letter no. RDSO/2013/EL/MS/0420, Rev. "0" Dated 23.01.13'
        ]
      },
      {
        code: 'F0101P2',
        message: 'OVER TEMPERATURE CONTROL ELECTRONICS',
        description: 'Turn off the loco. Set up cooling mode',
        indicators: {
          LSCE: 'ON',
          BPFA: 'ON'
        },
        effects: ['Control electronics contactor will not close'],
        troubleshooting: [
          'Check MCBs on HB/SB panel. If tripped, reset once (MCB 54.1/1 and 54.1/2 on both HB panel and MCBs 127.91/1 and 127.91/2 on both SB panel)',
          'If TE is available, clear blank section. Otherwise try to clear blank section while coasting',
          'Acknowledge BPFA fault by pressing ACK',
          'Give attention master to inform station master to keep the loco idle for 10-15 minutes. Before shutting down the train, keep A-9 to emergency position (to prevent MR from dropping)',
          'Turn OFF control electronics. Keep BL Key to "C" position, raise panto by ZPT, close VCB. Both machine room blowers and both underframe blowers will start, loco will remain in cooling mode and control electronics will cool down. Wait for LSCE to stop buzzing',
          'If VCB opens during cooling mode, check OCR {78} and all oil points before closing VCB and act accordingly',
          'After LSCE stops buzzing, open VCB and raise panto. Keep BL Key to "D" position, raise panto, close VCB and start traction'
        ]
      },
      {
        code: 'F0102P2',
        message: 'TRANSFORMER OIL PRESSURE NOT OK',
        description: 'Any oil pump circuit not working, TE/BE will be reduced',
        indicators: {
          BPFA: 'ON'
        },
        effects: ['TE/BE will be reduced possibility', 'Ventilation will increase', 'VCB will trip'],
        troubleshooting: [
          'If TE is available, clear blank section. Otherwise try to clear blank section while coasting',
          'Bring throttle to "0" position and acknowledge BPFA fault by pressing ACK',
          'If VCB trips, acknowledge BPFA fault, close VCB and try to clear blank section while coasting',
          'Touch inlet and outlet pipe of transformer oil pump by hand and ensure transformer oil pump operation. Check MCB 62.1/1 on HB-1 panel and MCB 62.1/2 on HB-2. If tripped, open VCB and reset once',
          'Close VCB, if successful run the train'
        ]
      },
      {
        code: 'F0103P2',
        message: 'EARTH FAULT AUX. WINDING CIRCUIT',
        description: 'Normal operation can continue. To be checked during maintenance',
        indicators: {
          BPFA: 'ON'
        },
        effects: [],
        troubleshooting: [
          'Check for fire or fire smell in machine room auxiliary. If damaged, contact related auxiliary MCB. Acknowledge BPFA fault by pressing ACK',
          'If same fault comes again, trouble shoot as per additional instructions given at end of SS-01',
          'Inform TLC and record in log book'
        ]
      },
      {
        code: 'F0104P2',
        message: 'LOW FREQUENCY CATENARY VOLTAGE',
        description: 'Wait for 1 minute and set TE/BE again',
        indicators: {
          BPFA: 'ON'
        },
        effects: ['Traction will be ON above 45 Hertz'],
        troubleshooting: [
          'Clear blank section while coasting. Acknowledge BPFA fault by pressing ACK',
          'Inform TLC and record in determined stamp in log book',
          'Keep trying for traction and on successful operation normal operation'
        ]
      },
      {
        code: 'F0105P2',
        message: 'CATENARY FREQUENCY IS HIGH',
        description: 'Bring throttle to zero',
        indicators: {
          BPFA: 'ON'
        },
        effects: ['Traction will be ON below 55 Hertz frequency'],
        troubleshooting: [
          'Clear blank section while coasting. Acknowledge BPFA fault by pressing ACK',
          'Inform TLC and record in determined stamp in log book',
          'Keep trying for traction and on successful operation normal operation'
        ]
      },
      {
        code: 'F0106P2',
        message: 'AUXILIARY CAPACITOR MACHINE ROOM BLOWER NOT OFF',
        description: 'Continue normal traction',
        indicators: {
          BPFA: 'ON'
        },
        effects: [],
        troubleshooting: [
          'If machine room blower 1 and 2 are running, acknowledge BPFA fault by pressing ACK and continue normal operation',
          'Inform TLC and record in determined stamp in log book'
        ]
      },
      {
        code: 'F0107P2',
        message: 'DEMANDED SPEED CAN NOT BE ACHIEVED',
        description: '',
        indicators: {
          BPFA: 'ON'
        },
        effects: ['Speed will not increase more than 1 kmph and loco will run with jerk (heavy jerk) on giving more than 50% TE'],
        troubleshooting: [
          'Acknowledge BPFA fault by pressing ACK',
          'If the loco (WAG9, WAG9H, WAP7) has toggle switch on traction converter, operate toggle switch below, between or above speed sensor as per DDS background message number 0052, 0053 or 0054 ASC1 ERROR TECHO GENERATOR messages, on SR-1 and bypass. Similarly - If DDS background message number 0052, 0053 or 0054 ASC2 ERROR TECHO GENERATOR messages come, operate toggle switch below, between or above speed sensor as per messages on SR-2 and bypass',
          'If the loco does not have toggle switch on traction converter, isolate related traction converter as per following DDS messages: a) If message is ASC1 Error Techo Generator 1/2/3, turn OFF control electronics and isolate traction converter-1 by MCB 127.1/1 and 127.11/1 (SB-1). Work with one traction bogie. Inform TLC. b) If message is ASC2 Error Techo Generator 1/2/3, turn OFF control electronics and isolate traction converter-2 by MCB 127.1/2 and 127.11/2 (SB-2). Work with one traction bogie. Inform TLC'
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
        effects: ['VCB will open'],
        troubleshooting: [
          'Bring throttle to "0" position. Acknowledge BPFA fault by pressing ACK',
          'Check MCB 127.1/1 (SB1). If tripped, turn OFF control electronics and reset once',
          'Press BLDJ to close VCB',
          'If same message comes again, turn OFF control electronics after 5 minutes and ON. Raise panto, close VCB and if loco becomes normal start traction',
          'If same message comes again and traction bogie-1 does not isolate on its own, isolate bogie-1 by MCB 127.1/1 and 127.11/1 (SB-1) (MCE OFF)',
          'Inform TLC and record bogie isolated message in log book before it comes in DDS'
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
        effects: ['VCB will open'],
        troubleshooting: [
          'Bring throttle to "0" position. Acknowledge BPFA fault by pressing ACK',
          'In CCB-2 loco - Check MR and FP pressure gauge. If pressure is low, keep MPJ to "0" position and repair it',
          'Press BLDJ to close VCB',
          'Check air leakage in SR-1 {traction converter-1}. If air leakage is there, isolate SR-1 by cock (125) on pneumatic panel. Isolate COC125 right and inside (fourth from above) on pneumatic panel and then isolate bogie-1 by switch 154 (SB-1)',
          'Press BLDJ to close VCB. If VCB does not close and same message comes again, isolate bogie-1'
        ]
      },
      {
        code: 'F0203P1',
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
          'Check MCB 127.11/1 on SB-1. If tripped, turn OFF control electronics and reset once',
          'Press BLDJ to close VCB'
        ]
      },
      {
        code: 'F0205P1',
        message: 'CONVERTER-1 OIL TEMPERATURE TOO HIGH',
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
          'Check MCB 59.1/1 and 63.1/1 on HB-1 panel. If tripped, open VCB and reset once. Close VCB and ensure traction converter oil pump-1 operation',
          'Ensure OCB-1 operation from radiator in underframe by air coming through it',
          'Check loco pilot OCB-1 impeller and casing for any damage. If damaged, open VCB and raise panto. Trip MCB 59.1/1, MCB 62.1/1 and MCB 63.1/1 on HB-1, then isolate bogie-1 by switch 154 (on SB-1)',
          'Energize loco and run train with one bogie. In this situation LSFI will keep blinking continuously. Inform TLC and record in log book'
        ]
      },
      {
        code: 'F0206P1',
        message: 'CONVERTER 1 OIL PRESSURE NOT OK',
        description: 'Check oil level, Try to close the VCB again',
        indicators: {
          LSDJ: 'ON',
          BPFA: 'ON',
          LSFI: 'BLINKING'
        },
        effects: ['VCB will open'],
        troubleshooting: [
          'Bring throttle to "0" position. Acknowledge BPFA fault by pressing ACK',
          'Check oil level in converter expansion tank on converter cubicle. If above maximum or below minimum, isolate bogie-1 by switch 154 to "I" and work with half traction',
          'If oil level is OK, check MCB 63.1/1 on HB-1 panel. If tripped, open VCB and reset once. Check if SR-1 oil pump in machine room is running or not by touching its inlet and outlet pipe',
          'If MCB 63.1/1 trips again after one reset, do not reset it again. Bogie-1 will isolate on its own. Work with half traction',
          'Check loco pilot traction converter-1 oil pump line for oil leakage and any damage and check oil cooling blower-1 casing impeller for any damage from underframe. In such situation radiator damage can cause oil leakage and "Converter No.1 oil pressure low" message may come. Loco pilot open VCB, raise panto and trip MCB 59.1/1 and MCB 63.1/1 on HB-1 panel. Isolate bogie-1 by switch 154 to "I". Energize loco and work with one bogie. In above situation no. 2 and 5, LSFI will keep blinking continuously. Inform TLC and record in log book',
          'If SR-1 oil pump is normal, turn OFF control electronics and isolate BUR-2 by MCB 127.22/2',
          'If successful, run train with BUR-2 isolated',
          'If not successful, isolate bogie-1 by switch 154 to "I". Inform TLC'
        ]
      },
      {
        code: 'F0207P1',
        message: 'TRACTION MOTOR TEMPERATURE TOO HIGH',
        description: 'Converter 1 blocked, Bogie 1 may get isolated',
        indicators: {
          BPFA: 'ON'
        },
        effects: [],
        troubleshooting: [
          'Clear blank section and bring throttle to "0" position. Acknowledge BPFA fault by pressing ACK',
          'Check if traction motor blower-1 is working or not, manually check air suction through TM Louver. Check MCB 53.1/1 on HB-1 panel. If tripped, open VCB and reset once'
        ]
      },
      {
        code: 'F0201P2',
        message: 'EARTH FAULT IN CONVERTER 1',
        description: 'Normal operation can continue. To be checked during maintenance',
        indicators: {
          BPFA: 'ON'
        },
        effects: [],
        troubleshooting: [
          'Acknowledge BPFA fault by pressing ACK. Continue normal operation',
          'Inform TLC and record in log book'
        ]
      },
      {
        code: 'F0202P2',
        message: 'TRACTION MOTOR OVERSPEED',
        description: 'TE is being reduced',
        indicators: {
          BPFA: 'ON'
        },
        effects: [],
        troubleshooting: [
          'Reduce speed. Acknowledge BPFA fault by pressing ACK',
          'Continue normal operation',
          'If within speed limit and TE reduces to "0", open VCB and isolate bogie-1 by switch 154 to "1"'
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
          'Acknowledge BPFA fault by pressing ACK. Continue normal operation',
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
  }
};

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = THREE_PHASE_LOCO_FAULTS;
}
