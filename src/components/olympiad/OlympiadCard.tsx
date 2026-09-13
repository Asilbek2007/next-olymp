import React from 'react';
import { Link } from 'react-router-dom';
import { Olympiad } from '../../types';
import { Card } from '../common/Card';
import { Badge } from '../common/Badge';
import { Button } from '../common/Button';
import { Clock, Users, Trophy, ArrowRight, Calendar } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface OlympiadCardProps {
  olympiad: Olympiad;
}

export const OlympiadCard: React.FC<OlympiadCardProps> = ({ olympiad }) => {
  const { t } = useTranslation();

  return (
    <Card hoverEffect className="overflow-hidden flex flex-col justify-between group">
      <div>
        {/* Cover Image & Status Badge Overlay */}
        <div className="relative h-44 w-full bg-accent-900 overflow-hidden">
          <img
            src={olympiad.imageUrl || 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=800&auto=format&fit=crop&q=80'}
            alt={olympiad.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 opacity-90"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-accent-950/80 via-transparent to-black/20" />
          
          <div className="absolute top-3 left-3 flex gap-2">
            <Badge subject={olympiad.subject} />
            <Badge status={olympiad.status} />
          </div>

          <div className="absolute bottom-3 left-3 right-3 text-white">
            <span className="text-[11px] font-semibold tracking-wider text-accent-300 uppercase block">
              {olympiad.organizer}
            </span>
          </div>
        </div>

        {/* Content Details */}
        <div className="p-5 space-y-3">
          <h3 className="text-base font-bold text-accent-900 leading-snug line-clamp-2 group-hover:text-primary transition-colors">
            {olympiad.title}
          </h3>

          <p className="text-xs text-accent-600 line-clamp-2 leading-relaxed">
            {olympiad.description}
          </p>

          <div className="grid grid-cols-2 gap-2 pt-2 border-t border-border text-xs text-accent-600">
            <div className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-primary shrink-0" />
              <span>{olympiad.durationMinutes} daqiqa</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-secondary shrink-0" />
              <span>{olympiad.participantsCount} ishtirokchi</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-amber-500 shrink-0" />
              <span>{new Date(olympiad.startDate).toLocaleDateString('uz-UZ')}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Trophy className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
              <span>{olympiad.maxScore} max ball</span>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Action */}
      <div className="p-5 pt-0">
        <Link to={`/olympiads/${olympiad.id}`}>
          <Button
            variant={olympiad.status === 'active' ? 'primary' : 'outline'}
            className="w-full"
            rightIcon={<ArrowRight className="w-4 h-4" />}
          >
            {olympiad.status === 'active'
              ? t('olympiads.participate')
              : olympiad.status === 'upcoming'
              ? t('olympiads.details')
              : t('olympiads.details')}
          </Button>
        </Link>
      </div>
    </Card>
  );
};
