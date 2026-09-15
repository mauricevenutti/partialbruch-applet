(* In einem Wolfram-Cloud-Notebook ausführen. Die ausgegebene URL im Applet eintragen. *)
ClearAll[s];

verifier = APIFunction[
  {"original" -> "String", "decomposition" -> "String"},
  Function[params,
    Module[{original = params["original"], decomposition = params["decomposition"], lhs, rhs, valid, apart},
      Quiet[
        Check[
          If[StringLength[original] > 5000 || StringLength[decomposition] > 5000 ||
             ! StringMatchQ[original, RegularExpression["[0-9s+\\-*/^(). ]+"]] ||
             ! StringMatchQ[decomposition, RegularExpression["[0-9s+\\-*/^(). ]+"]],
            Return[<|"valid" -> False, "apart" -> "", "message" -> "Unzulässiger Ausdruck."|>]
          ];
          lhs = ToExpression[original, InputForm, HoldComplete];
          rhs = ToExpression[decomposition, InputForm, HoldComplete];
          lhs = ReleaseHold[lhs];
          rhs = ReleaseHold[rhs];
          {valid, apart} = TimeConstrained[
            {TrueQ[Together[lhs - rhs] === 0], ToString[Apart[lhs, s], InputForm]},
            5,
            {False, "Zeitüberschreitung"}
          ];
          <|"valid" -> valid, "apart" -> apart,
            "message" -> If[valid, "Identität exakt bestätigt.", "Ausdrücke sind nicht identisch."]|>,
          <|"valid" -> False, "apart" -> "", "message" -> "Ausdruck konnte nicht geprüft werden."|>
        ]
      ]
    ]
  ],
  "JSON"
];

CloudDeploy[
  verifier,
  "partialbruch-check",
  Permissions -> "Public"
]
