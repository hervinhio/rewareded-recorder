package com.hervinhio.rewardedkeeper.jsinterface;

public class Auth {
  private lateinit var auth: FirebaseAuth

  constructor() {
    auth = Firebase.auth
  }
}
