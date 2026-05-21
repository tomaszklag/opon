import React from 'react';
import { Modal as RNModal, View, Pressable, StyleSheet } from 'react-native';
import { t } from '../tokens.native';
import { Heading } from '../typography/Heading';
import { Text } from '../typography/Text';

interface ModalProps {
  visible: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
}

export function Modal({ visible, onClose, title, children }: ModalProps) {
  return (
    <RNModal
      visible={visible}
      animationType="slide"
      transparent
      statusBarTranslucent
      onRequestClose={onClose}
    >
      {/* Overlay — rgba is a justified exception: semi-transparent dim layer, not a UI color */}
      <View style={styles.overlay}>
        <View style={styles.sheet}>
          <View style={styles.header}>
            {title ? (
              <Heading variant="h3" style={styles.title}>
                {title}
              </Heading>
            ) : (
              <View />
            )}
            <Pressable
              onPress={onClose}
              accessibilityRole="button"
              accessibilityLabel="Zamknij"
              hitSlop={t.spacing[3]}
              style={styles.closeBtn}
            >
              <Text variant="body" color="textMuted">
                ✕
              </Text>
            </Pressable>
          </View>
          {children}
        </View>
      </View>
    </RNModal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
    // rgba justified exception: semi-transparent overlay dimmer, not a design token UI color
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  sheet: {
    backgroundColor: t.colors.surface,
    borderRadius: t.radius.xl,
    padding: t.spacing[6],
    marginHorizontal: t.spacing[4],
    marginBottom: t.spacing[8],
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: t.spacing[4],
  },
  title: {
    flex: 1,
  },
  closeBtn: {
    marginLeft: t.spacing[3],
  },
});
