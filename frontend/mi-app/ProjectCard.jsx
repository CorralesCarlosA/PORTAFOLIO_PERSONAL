import React from 'react';
import { StyleSheet, Text, View, Image, TouchableOpacity } from 'react-native';

export default function ProjectCard({ project, onSelect, onVote }) {
  if (!project) return null;

  return (
    <View style={styles.projectCard}>
      <View style={styles.cardImageContainer}>
        <Image
          source={{
            uri: project.media && project.media.length > 0 && project.media[0].file_path.startsWith('http')
              ? project.media[0].file_path
              : "https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=800&q=80"
          }}
          style={styles.cardImage}
          resizeMode="cover"
        />
        <View style={styles.categoryBadgeOnCard}>
          <Text style={styles.categoryBadgeText}>{project.category_name || "General"}</Text>
        </View>
      </View>

      <View style={styles.cardBody}>
        <Text style={styles.cardTitle}>{project.title}</Text>
        <Text style={styles.cardDesc} numberOfLines={3}>
          {project.description}
        </Text>

        <View style={styles.techStackContainer}>
          {(project.technologies || []).map((t, idx) => (
            <View key={idx} style={styles.techTag}>
              <Text style={styles.techName}>{t.name}</Text>
            </View>
          ))}
        </View>
      </View>

      <View style={styles.cardFooter}>
        <TouchableOpacity
          style={styles.voteBadge}
          onPress={() => onVote && onVote(project.id)}
          activeOpacity={0.7}
        >
          <Text style={styles.voteBadgeText}>Votos: {project.votes_count || 0}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.detailBtn}
          onPress={() => onSelect && onSelect(project)}
          activeOpacity={0.8}
        >
          <Text style={styles.detailBtnText}>Ver Detalles</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  projectCard: {
    backgroundColor: '#1e293b',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#334155',
    overflow: 'hidden',
    flexDirection: 'column',
    justifyContent: 'space-between',
  },
  cardImageContainer: {
    height: 170,
    width: '100%',
    position: 'relative',
    backgroundColor: '#0f172a',
  },
  cardImage: {
    width: '100%',
    height: '100%',
  },
  categoryBadgeOnCard: {
    position: 'absolute',
    top: 12,
    left: 12,
    backgroundColor: 'rgba(15, 23, 42, 0.85)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  categoryBadgeText: {
    color: '#38bdf8',
    fontSize: 11,
    fontWeight: 'bold',
  },
  cardBody: {
    padding: 18,
    flex: 1,
  },
  cardTitle: {
    color: '#f8fafc',
    fontSize: 17,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  cardDesc: {
    color: '#94a3b8',
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 14,
  },
  techStackContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  techTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0f172a',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    gap: 4,
  },
  techIcon: {
    fontSize: 12,
  },
  techName: {
    color: '#cbd5e1',
    fontSize: 11,
    fontWeight: '500',
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 18,
    paddingVertical: 14,
    borderTopWidth: 1,
    borderTopColor: '#334155',
    backgroundColor: 'rgba(15, 23, 42, 0.5)',
  },
  voteBadge: {
    backgroundColor: '#0f172a',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#334155',
  },
  voteBadgeText: {
    color: '#10b981',
    fontSize: 12,
    fontWeight: 'bold',
  },
  detailBtn: {
    backgroundColor: '#38bdf8',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
  },
  detailBtnText: {
    color: '#0f172a',
    fontSize: 12,
    fontWeight: 'bold',
  },
});