import React from 'react'
import { Text, TouchableOpacity, ActivityIndicator } from 'react-native'
import { Colors } from '../../constants/colors'

interface ButtonProps {
  label: string
  onPress: () => void
  disabled?: boolean
  loading?: boolean
  variant?: 'primary' | 'secondary' | 'danger'
}

const Button = ({ label, onPress, disabled, loading, variant = 'primary' }: ButtonProps) => {
  const getVariantStyles = () => {
    switch (variant) {
      case 'secondary': return 'bg-surfaceAlt'
      case 'danger': return 'bg-danger/10'
      default: return 'bg-primary'
    }
  }

  const getTextColor = () => {
    switch (variant) {
      case 'secondary': return 'text-textPrimary'
      case 'danger': return 'text-danger'
      default: return 'text-background'
    }
  }

  return (
    <TouchableOpacity
      disabled={disabled || loading}
      onPress={onPress}
      className={`h-14 w-full rounded-2xl items-center justify-center ${getVariantStyles()} ${disabled ? 'opacity-50' : ''}`}
    >
      {loading ? (
        <ActivityIndicator color={variant === 'primary' ? Colors.background : Colors.primary} />
      ) : (
        <Text className={`font-bold text-lg ${getTextColor()}`}>{label}</Text>
      )}
    </TouchableOpacity>
  )
}

export default Button
