function getSenderWithoutSecondSecret() {
  return {
    secret:
      "scan pass carpet coral pumpkin spell present decrease veteran text flower pioneer top speak jaguar wreck ask always hazard good know gift uncle frost",
    address: "cCET2Sxt2LPDhx44wxJ9uhkpviKNrSacvE",
    publicKey: "6e8330144a8c123c017a8f5c363531868d3ce21c45b4a668cc1767c2b4695c84",
  };
}

function getSenderWithSecondSecret() {
  return {
    secret:
      "scan pass carpet coral pumpkin spell present decrease veteran text flower pioneer top speak jaguar wreck ask always hazard good know gift uncle frost",
    secondSecret: "trouble is a frend",
    address: "cCET2Sxt2LPDhx44wxJ9uhkpviKNrSacvE",
    publicKey: "6e8330144a8c123c017a8f5c363531868d3ce21c45b4a668cc1767c2b4695c84",
  };
}

function getRecipientWithoutSecondSecret() {
  return {
    secret:
      "upgrade jump sugar congress glare expect other firm morning donate motor pride minute frame amount chimney wood gallery twelve barely dose blame convince enhance",
    address: "cLrUCNAWPyPH96bqqC3JQXZ3CtsvvXmNj1",
    publicKey: "0f88fe3a155927907b507c10ccd0318a7f3b2f55aeb6c90913756ef43db4e836",
  };
}

function getRecipientWithSecondSecret() {
  return {
    secret:
      "upgrade jump sugar congress glare expect other firm morning donate motor pride minute frame amount chimney wood gallery twelve barely dose blame convince enhance",
    secondSecret: "may this soul always smile",
    address: "cLrUCNAWPyPH96bqqC3JQXZ3CtsvvXmNj1",
    publicKey: "0f88fe3a155927907b507c10ccd0318a7f3b2f55aeb6c90913756ef43db4e836",
  };
}

function getGenesisAccount() {
  return {
    secret:
      "nose install correct solar side latin focus churn mask nominee differ mosquito claw awake glass rare pond clump draw rent fiction muscle razor bacon",
    address: "cEAXDkaEJgWKMM61KYz2dYU1RfuxbB8Ma",
    publicKey: "4bda2c5366b10e709c560e846e4041d355446c910dd6238e418092af5736c227",
  };
}

function getDelegateWithSecondSecret() {
  return {
    secret:
      "upgrade jump sugar congress glare expect other firm morning donate motor pride minute frame amount chimney wood gallery twelve barely dose blame convince enhance",
    secondSecret: "may this soul always smile",
    address: "cLrUCNAWPyPH96bqqC3JQXZ3CtsvvXmNj1",
    publicKey: "0f88fe3a155927907b507c10ccd0318a7f3b2f55aeb6c90913756ef43db4e836",
    username: "bfchain2",
  };
}

function getDelegateWithoutSecondSecret() {
  return {
    secret:
      "upgrade jump sugar congress glare expect other firm morning donate motor pride minute frame amount chimney wood gallery twelve barely dose blame convince enhance",
    address: "cLrUCNAWPyPH96bqqC3JQXZ3CtsvvXmNj1",
    publicKey: "0f88fe3a155927907b507c10ccd0318a7f3b2f55aeb6c90913756ef43db4e836",
    username: "bfchain2",
  };
}

export {
  getSenderWithSecondSecret,
  getSenderWithoutSecondSecret,
  getGenesisAccount,
  getRecipientWithSecondSecret,
  getRecipientWithoutSecondSecret,
  getDelegateWithSecondSecret,
  getDelegateWithoutSecondSecret,
};
