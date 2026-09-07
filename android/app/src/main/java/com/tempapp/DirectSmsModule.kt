package com.tempapp

import android.os.Build
import android.telephony.SmsManager
import android.telephony.SubscriptionManager
import android.util.Log
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod

class DirectSmsModule(private val reactContext: ReactApplicationContext) : ReactContextBaseJavaModule(reactContext) {
    override fun getName(): String {
        return "DirectSms"
    }

    private fun getSmsManager(): SmsManager {
        try {
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
                val subId = SubscriptionManager.getDefaultSmsSubscriptionId()
                if (subId != SubscriptionManager.INVALID_SUBSCRIPTION_ID) {
                    val systemManager = reactContext.getSystemService(SmsManager::class.java)
                    if (systemManager != null) {
                        return systemManager.createForSubscriptionId(subId)
                    }
                }
                val systemManager = reactContext.getSystemService(SmsManager::class.java)
                if (systemManager != null) {
                    return systemManager
                }
            }
        } catch (e: Exception) {
            Log.w("DirectSms", "Failed getting SmsManager via system service: ${e.message}")
        }
        @Suppress("DEPRECATION")
        return SmsManager.getDefault()
    }

    @ReactMethod
    fun sendDirectSms(phoneNumber: String, message: String, promise: Promise? = null) {
        try {
            var cleanPhone = phoneNumber.replace(Regex("[^0-9+]"), "")
            if (cleanPhone.isEmpty()) {
                promise?.reject("INVALID_PHONE", "Phone number is empty or invalid")
                return
            }

            if (cleanPhone.length == 10 && !cleanPhone.startsWith("+")) {
                cleanPhone = "+91$cleanPhone"
            }

            Log.d("DirectSms", "sendDirectSms to $cleanPhone, length=${message.length}")
            val smsManager = getSmsManager()
            val parts = smsManager.divideMessage(message)

            if (parts.size > 1) {
                smsManager.sendMultipartTextMessage(cleanPhone, null, parts, null, null)
            } else {
                smsManager.sendTextMessage(cleanPhone, null, message, null, null)
            }
            Log.d("DirectSms", "SMS dispatched successfully to $cleanPhone")
            promise?.resolve(true)
        } catch (ex: Exception) {
            Log.e("DirectSms", "sendDirectSms failed: ${ex.message}", ex)
            promise?.reject("SMS_FAILED", ex.message ?: "Failed to send direct SMS")
        }
    }
}
